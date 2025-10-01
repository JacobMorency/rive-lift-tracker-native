import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import ExerciseTracker from "../components/exercisetracker";

type Exercise = {
  id: number;
  name: string;
  category: string;
};

type SessionData = {
  id: string;
  started_at: string;
  workout_id: string;
  workout_name: string;
  exercises: Exercise[];
  completed: boolean;
};

type RawWorkoutExercise = {
  exercise_id: number;
  order_index: number;
};

type RawExercise = {
  id: number;
  name: string;
  category: string;
};

type ExerciseProgress = {
  exerciseId: number;
  exerciseName: string;
  sets: any[];
  completed: boolean;
};

type RawExerciseSet = {
  id: string;
  reps: number;
  weight: number;
  partial_reps: number;
  created_at: string;
};

export default function SessionDetailPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<
    number | null
  >(null);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>(
    []
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (user && id) {
      fetchSessionData();
    }
  }, [user, id]);

  const fetchSessionData = async () => {
    try {
      // First query: Fetch session data
      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("id, started_at, workout_id, completed")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (sessionError) {
        console.error("Error fetching session:", sessionError.message);
        return;
      }

      // Second query: Fetch workout name
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("name")
        .eq("id", sessionData.workout_id)
        .single();

      if (workoutError) {
        console.error("Error fetching workout:", workoutError.message);
        return;
      }

      // Third query: Fetch workout exercises
      const { data: workoutExercisesData, error: workoutExercisesError } =
        await supabase
          .from("workout_exercises")
          .select("exercise_id, order_index")
          .eq("workout_id", sessionData.workout_id)
          .order("order_index", { ascending: true });

      if (workoutExercisesError) {
        console.error(
          "Error fetching workout exercises:",
          workoutExercisesError.message
        );
        return;
      }

      if (!workoutExercisesData || workoutExercisesData.length === 0) {
        setSessionData({
          id: sessionData.id,
          started_at: sessionData.started_at,
          workout_id: sessionData.workout_id,
          workout_name: workoutData.name,
          exercises: [],
          completed: sessionData.completed || false,
        });
        return;
      }

      // Get unique exercise IDs
      const exerciseIds = workoutExercisesData.map((we) => we.exercise_id);

      // Fourth query: Fetch exercise details
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_library")
        .select("id, name, category")
        .in("id", exerciseIds);

      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError.message);
        return;
      }

      // Create a map of exercise IDs to exercise details
      const exerciseMap = new Map<number, RawExercise>();
      exercisesData?.forEach((exercise) => {
        exerciseMap.set(exercise.id, exercise);
      });

      // Transform the exercises data
      const exercises = workoutExercisesData
        .map((we: RawWorkoutExercise) => {
          const exercise = exerciseMap.get(we.exercise_id);
          return exercise
            ? {
                id: exercise.id,
                name: exercise.name,
                category: exercise.category,
              }
            : null;
        })
        .filter((exercise): exercise is Exercise => exercise !== null);

      // Initialize exercise progress
      const initialProgress = exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [],
        completed: false,
      }));

      // Set session data first
      const finalSessionData = {
        id: sessionData.id,
        started_at: sessionData.started_at,
        workout_id: sessionData.workout_id,
        workout_name: workoutData.name,
        exercises,
        completed: sessionData.completed || false,
      };
      setSessionData(finalSessionData);

      // Load existing exercise data from database
      const loadedProgress = await loadExistingExerciseData(
        exercises,
        initialProgress,
        finalSessionData
      );
      setExerciseProgress(loadedProgress);
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingExerciseData = async (
    exercises: Exercise[],
    initialProgress: ExerciseProgress[],
    sessionDataToUse: SessionData
  ) => {
    if (!sessionDataToUse) {
      return initialProgress;
    }

    try {
      // Get all session exercises for this session with their sets
      const { data: sessionExercises, error: sessionExercisesError } =
        await supabase
          .from("session_exercises")
          .select(
            `
          id,
          exercise_id,
          order_index,
          exercise_sets (
            id,
            reps,
            weight,
            partial_reps,
            created_at
          )
        `
          )
          .eq("session_id", sessionDataToUse.id)
          .order("order_index");

      if (sessionExercisesError) {
        console.error(
          "Error loading session exercises:",
          sessionExercisesError
        );
        return initialProgress;
      }

      // Update exercise progress with loaded data
      const updatedProgress = [...initialProgress];

      sessionExercises?.forEach((sessionExercise) => {
        const exerciseIndex = exercises.findIndex(
          (ex) => ex.id === sessionExercise.exercise_id
        );

        if (exerciseIndex !== -1) {
          // Sort sets by created_at to maintain order
          const sortedSets =
            sessionExercise.exercise_sets?.sort(
              (a: RawExerciseSet, b: RawExerciseSet) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            ) || [];

          const sets = sortedSets.map((set: RawExerciseSet, index: number) => ({
            id: set.id,
            reps: set.reps,
            weight: set.weight,
            partialReps: set.partial_reps,
            set_number: index + 1,
          }));

          updatedProgress[exerciseIndex] = {
            ...updatedProgress[exerciseIndex],
            sets,
            completed: sets.length > 0,
          };
        }
      });

      return updatedProgress;
    } catch (error) {
      console.error("Error loading existing exercise data:", error);
      return initialProgress;
    }
  };

  const handleExerciseClick = (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
  };

  const handleExerciseComplete = async (sets: any[]) => {
    if (currentExerciseIndex === null) return;

    const updatedProgress = [...exerciseProgress];
    updatedProgress[currentExerciseIndex] = {
      ...updatedProgress[currentExerciseIndex],
      sets,
      completed: true,
    };
    setExerciseProgress(updatedProgress);
    setCurrentExerciseIndex(null);

    // Save exercise data to database
    await saveExerciseData(currentExerciseIndex, sets);
  };

  const saveExerciseData = async (exerciseIndex: number, sets: any[]) => {
    if (!sessionData || !user) return;

    const exercise = sessionData.exercises[exerciseIndex];

    try {
      // First, check if session_exercise record exists
      const { data: existingSessionExercises, error: checkError } =
        await supabase
          .from("session_exercises")
          .select("id")
          .eq("session_id", sessionData.id)
          .eq("exercise_id", exercise.id);

      if (checkError) {
        console.error("Error checking session exercise:", checkError);
        return;
      }

      let sessionExerciseData;

      if (existingSessionExercises && existingSessionExercises.length > 0) {
        // Update existing record
        const { data: updatedData, error: updateError } = await supabase
          .from("session_exercises")
          .update({ order_index: exerciseIndex })
          .eq("id", existingSessionExercises[0].id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating session exercise:", updateError);
          return;
        }
        sessionExerciseData = updatedData;
      } else {
        // Insert new record
        const { data: insertedData, error: insertError } = await supabase
          .from("session_exercises")
          .insert({
            session_id: sessionData.id,
            exercise_id: exercise.id,
            order_index: exerciseIndex,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting session exercise:", insertError);
          return;
        }
        sessionExerciseData = insertedData;
      }

      // Delete existing sets for this exercise
      await supabase
        .from("exercise_sets")
        .delete()
        .eq("session_exercise_id", sessionExerciseData.id);

      // Insert new sets with proper order
      if (sets.length > 0) {
        const setsToInsert = sets.map((set) => ({
          session_exercise_id: sessionExerciseData.id,
          reps: set.reps,
          weight: set.weight,
          partial_reps: set.partialReps || 0,
        }));

        const { error: setsError } = await supabase
          .from("exercise_sets")
          .insert(setsToInsert);

        if (setsError) {
          console.error("Error saving sets:", setsError);
        }
      }
    } catch (error) {
      console.error("Error saving exercise data:", error);
    }
  };

  const handleBackToExercises = () => {
    setCurrentExerciseIndex(null);
  };

  const handleBack = () => {
    router.push("/(tabs)/sessions");
  };

  const handleCancelSession = () => {
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this session? This will permanently delete the session and all your progress.",
      [
        { text: "Keep Session", style: "cancel" },
        {
          text: "Delete Session",
          style: "destructive",
          onPress: handleConfirmCancel,
        },
      ]
    );
  };

  const handleConfirmCancel = async () => {
    if (!sessionData || !user) return;

    try {
      // Delete the session from the database
      const { error: deleteError } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("id", sessionData.id);

      if (deleteError) {
        console.error("Error deleting session:", deleteError);
        return;
      }

      // Navigate back to sessions list
      router.push("/(tabs)/sessions");
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionData || !user) return;

    try {
      // Update the session to mark it as completed
      const { error: updateError } = await supabase
        .from("workout_sessions")
        .update({
          completed: true,
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionData.id);

      if (updateError) {
        console.error("Error completing session:", updateError);
        return;
      }

      // Navigate back to sessions list
      router.push("/(tabs)/sessions");
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View
          className="bg-white px-4 border-b border-gray-200"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <Text className="text-2xl font-bold text-gray-900">Session</Text>
        </View>

        {/* Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <Text className="text-gray-600 mt-2">Loading session...</Text>
        </View>
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View
          className="bg-white px-4 border-b border-gray-200"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <Text className="text-2xl font-bold text-gray-900">
            Session Not Found
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-600 text-center">
            Session not found or you don't have access to it.
          </Text>
        </View>
      </View>
    );
  }

  // If we're tracking an exercise, show the exercise tracker
  if (currentExerciseIndex !== null) {
    const exercise = sessionData.exercises[currentExerciseIndex];
    const progress = exerciseProgress[currentExerciseIndex];

    return (
      <ExerciseTracker
        exercise={exercise}
        onComplete={handleExerciseComplete}
        onBack={handleBackToExercises}
        initialSets={progress.sets}
      />
    );
  }

  // Show exercise list
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white px-4 border-b border-gray-200"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {sessionData.workout_name}
            </Text>
            <Text className="text-gray-600 mt-1">
              Started {new Date(sessionData.started_at).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="px-3 py-1 bg-green-500 rounded"
              onPress={handleCompleteSession}
              disabled={exerciseProgress.every((ex) => !ex.completed)}
            >
              <Text className="text-white text-sm">✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-3 py-1 bg-red-500 rounded"
              onPress={handleCancelSession}
            >
              <Text className="text-white text-sm">🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
        {/* Back Button */}
        <View className="mb-4">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleBack}
          >
            <Text className="text-blue-500 text-lg mr-2">←</Text>
            <Text className="text-blue-500">Back to Sessions</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Exercises ({sessionData.exercises.length})
          </Text>
          <Text className="text-gray-600 text-sm">
            Tap an exercise to start tracking your sets
          </Text>
        </View>

        {sessionData.exercises.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-6xl mb-4">🏋️</Text>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              No Exercises
            </Text>
            <Text className="text-gray-600 text-center">
              This workout template has no exercises
            </Text>
          </View>
        ) : (
          <View className="space-y-2">
            {sessionData.exercises.map((exercise, index) => {
              const progress = exerciseProgress[index];
              const isCompleted = progress?.completed;
              const setCount = progress?.sets.length || 0;

              return (
                <TouchableOpacity
                  key={exercise.id}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                  onPress={() => handleExerciseClick(index)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-medium text-gray-900">
                        {formatExerciseName(exercise.name)}
                      </Text>
                    </View>
                    <View className="flex-row items-center space-x-2">
                      {isCompleted && (
                        <View className="px-2 py-1 bg-green-100 rounded-full">
                          <Text className="text-green-800 text-xs font-medium">
                            {setCount} sets
                          </Text>
                        </View>
                      )}
                      <Text className="text-gray-400">›</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
