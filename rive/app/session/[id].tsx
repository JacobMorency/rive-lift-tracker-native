import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import { getLastSessionData } from "../lib/statsUtils";
import ExerciseTracker from "../components/exercisetracker";
import ExerciseSelector from "../components/exerciseselector";
import { Exercise as ExerciseSelectorExercise } from "../components/exercise/types";

import { MuscleGroup } from "../lib/muscleGroupUtils";

type Exercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // Replaces category
  wasInOriginalTemplate: boolean; // New field to track if exercise was in original session
  addedToTemplateAfter?: string; // When it was added to template
  notes?: string | null; // Notes for this exercise in the workout template
  workoutExerciseId?: string; // ID from workout_exercises table for updating notes
  sessionExerciseId?: string; // ID from session_exercises table for deletion tracking
};

type SessionData = {
  id: string;
  started_at: string;
  workout_id: string | null; // Nullable for sessions without templates
  name: string; // Session name (from session.name or workout.name)
  exercises: Exercise[];
  completed: boolean;
};

type RawExercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // Replaces category
};

type ExerciseProgress = {
  exerciseId: number;
  exerciseName: string;
  sets: any[];
  completed: boolean;
  volumeTrend?: "up" | "down" | "neutral";
  volumePercentage?: number;
};

type RawExerciseSet = {
  id: string;
  reps: number;
  weight: number;
  partial_reps: number;
  is_unilateral?: boolean;
  left_reps?: number;
  right_reps?: number;
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
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [lastSessionSets, setLastSessionSets] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (user && id) {
      fetchSessionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const fetchSessionData = async () => {
    try {
      // First query: Fetch session data (including name)
      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("id, started_at, workout_id, completed, name")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (sessionError) {
        console.error("Error fetching session:", sessionError.message);
        return;
      }

      // Get session name (from session.name or workout.name for backward compatibility)
      let sessionName = sessionData.name;

      // If no name in session and workout_id exists, fetch from workout (backward compatibility)
      if (!sessionName && sessionData.workout_id) {
        const { data: workoutData } = await supabase
          .from("workouts")
          .select("name")
          .eq("id", sessionData.workout_id)
          .single();

        if (workoutData) {
          sessionName = workoutData.name;
        }
      }

      // Fallback to formatted date if still no name
      if (!sessionName) {
        sessionName = new Date(sessionData.started_at).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );
      }

      // Fetch session exercises (primary source)
      const { data: sessionExercisesData, error: sessionExercisesError } =
        await supabase
          .from("session_exercises")
          .select("id, exercise_id, order_index")
          .eq("session_id", sessionData.id)
          .order("order_index", { ascending: true });

      if (sessionExercisesError) {
        console.error(
          "Error fetching session exercises:",
          sessionExercisesError.message
        );
        return;
      }

      // Optionally fetch workout exercises for notes (if workout_id exists)
      let workoutExerciseMap = new Map<
        number,
        { id: string; notes: string | null }
      >();

      if (sessionData.workout_id) {
        const { data: workoutExercisesData } = await supabase
          .from("workout_exercises")
          .select("id, exercise_id, order_index, notes")
          .eq("workout_id", sessionData.workout_id);

        workoutExercisesData?.forEach((we) => {
          workoutExerciseMap.set(we.exercise_id, {
            id: we.id,
            notes: we.notes || null,
          });
        });
      }

      // If no session exercises, return empty
      if (!sessionExercisesData || sessionExercisesData.length === 0) {
        setSessionData({
          id: sessionData.id,
          started_at: sessionData.started_at,
          workout_id: sessionData.workout_id,
          name: sessionName,
          exercises: [],
          completed: sessionData.completed || false,
        });
        setExerciseProgress([]);
        return;
      }

      // Get exercise IDs from session exercises
      const exerciseIds = sessionExercisesData.map((se) => se.exercise_id);

      // Fetch exercise details
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_library")
        .select("id, name")
        .in("id", exerciseIds);

      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError.message);
        return;
      }

      // Fetch muscle groups for all exercises
      const { getExercisesWithMuscleGroups } = await import(
        "../lib/muscleGroupUtils"
      );
      const muscleGroupMap = await getExercisesWithMuscleGroups(exerciseIds);

      // Create exercise map
      const exerciseMap = new Map<number, RawExercise>();
      exercisesData?.forEach((exercise) => {
        const muscleGroups = muscleGroupMap.get(exercise.id) || [];
        const primaryMuscleGroup =
          muscleGroups.find((mg) => mg.is_primary)?.name ||
          muscleGroups[0]?.name;
        exerciseMap.set(exercise.id, {
          ...exercise,
          muscleGroups,
          primaryMuscleGroup,
        });
      });

      // Build exercises array from session exercises
      const exercises = sessionExercisesData
        .map((se) => {
          const exercise = exerciseMap.get(se.exercise_id);
          const workoutExercise = workoutExerciseMap.get(se.exercise_id);

          if (!exercise) return null;

          return {
            id: exercise.id,
            name: exercise.name,
            muscleGroups: exercise.muscleGroups,
            primaryMuscleGroup: exercise.primaryMuscleGroup,
            wasInOriginalTemplate: !!workoutExercise,
            notes: workoutExercise?.notes || null,
            workoutExerciseId: workoutExercise?.id,
            sessionExerciseId: se.id,
          };
        })
        .filter(
          (exercise): exercise is NonNullable<typeof exercise> =>
            exercise !== null
        )
        .sort((a, b) => {
          const aIndex =
            sessionExercisesData.find((se) => se.exercise_id === a.id)
              ?.order_index ?? 0;
          const bIndex =
            sessionExercisesData.find((se) => se.exercise_id === b.id)
              ?.order_index ?? 0;
          return aIndex - bIndex;
        });

      // Initialize exercise progress
      const initialProgress = exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [],
        completed: false,
      }));

      // Set session data
      const finalSessionData = {
        id: sessionData.id,
        started_at: sessionData.started_at,
        workout_id: sessionData.workout_id,
        name: sessionName,
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
            is_unilateral,
            left_reps,
            right_reps,
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
            is_unilateral: set.is_unilateral || false,
            left_reps: set.left_reps || null,
            right_reps: set.right_reps || null,
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

  const handleExerciseClick = async (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);

    // Fetch last session data for this exercise
    if (user && sessionData) {
      const exercise = sessionData.exercises[exerciseIndex];
      // Only fetch last session data if workout_id exists (for backward compatibility)
      let lastSets: any[] = [];
      if (sessionData.workout_id) {
        lastSets = await getLastSessionData(
          user.id,
          sessionData.workout_id,
          exercise.id
        );
      }
      setLastSessionSets(lastSets);
    }
  };

  const handleExerciseComplete = async (sets: any[]) => {
    if (currentExerciseIndex === null) return;

    const updatedProgress = [...exerciseProgress];

    // Compute volume trend vs last session for this exercise
    const computeVolume = (inputSets: any[]) => {
      return inputSets.reduce((total, set) => {
        const reps = set.is_unilateral
          ? (set.left_reps || 0) + (set.right_reps || 0)
          : set.reps || 0;
        const weight = set.weight || 0;
        return total + weight * reps;
      }, 0);
    };

    const currentVolume = computeVolume(sets);
    const lastVolume = computeVolume(lastSessionSets || []);
    let volumeTrend: "up" | "down" | "neutral" = "neutral";
    let volumePercentage = 0;
    if (lastVolume > 0) {
      const change = currentVolume - lastVolume;
      volumePercentage = (change / lastVolume) * 100;
      if (change > 0) volumeTrend = "up";
      else if (change < 0) volumeTrend = "down";
      else volumeTrend = "neutral";
    } else if (currentVolume > 0) {
      // No last data; keep neutral to avoid misleading signal
      volumeTrend = "neutral";
      volumePercentage = 0;
    }

    updatedProgress[currentExerciseIndex] = {
      ...updatedProgress[currentExerciseIndex],
      sets,
      completed: true,
      volumeTrend,
      volumePercentage,
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
          reps: set.is_unilateral ? set.left_reps || 0 : set.reps, // Use left_reps for unilateral, regular reps otherwise
          weight: set.weight,
          partial_reps: set.partialReps || 0,
          is_unilateral: set.is_unilateral || false,
          left_reps: set.left_reps || null,
          right_reps: set.right_reps || null,
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

  const updateSessionName = async (newName: string) => {
    if (!sessionData || !user) return;

    try {
      const { error } = await supabase
        .from("workout_sessions")
        .update({ name: newName.trim() })
        .eq("id", sessionData.id);

      if (error) {
        console.error("Error updating session name:", error);
        Alert.alert("Error", "Failed to update session name");
        return;
      }

      setSessionData({
        ...sessionData,
        name: newName.trim(),
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating session name:", error);
      Alert.alert("Error", "Failed to update session name");
    }
  };

  const handleNotesUpdate = async (notes: string) => {
    if (
      currentExerciseIndex === null ||
      !sessionData ||
      !sessionData.exercises[currentExerciseIndex]?.workoutExerciseId
    ) {
      return;
    }

    const exercise = sessionData.exercises[currentExerciseIndex];
    const workoutExerciseId = exercise.workoutExerciseId;

    if (!workoutExerciseId) {
      console.error("No workoutExerciseId available for notes update");
      return;
    }

    try {
      // Update notes in workout_exercises table
      const { error: updateError } = await supabase
        .from("workout_exercises")
        .update({ notes: notes.trim() || null })
        .eq("id", workoutExerciseId);

      if (updateError) {
        console.error("Error updating exercise notes:", updateError);
        Alert.alert("Error", "Failed to save notes");
        return;
      }

      // Update local state to reflect the change
      const updatedExercises = [...sessionData.exercises];
      updatedExercises[currentExerciseIndex] = {
        ...updatedExercises[currentExerciseIndex],
        notes: notes.trim() || null,
      };

      setSessionData({
        ...sessionData,
        exercises: updatedExercises,
      });
    } catch (error) {
      console.error("Error updating exercise notes:", error);
      Alert.alert("Error", "Failed to save notes");
    }
  };

  const handleAddExercise = async (
    selectedExercises: ExerciseSelectorExercise[]
  ) => {
    if (!sessionData || !user || selectedExercises.length === 0) return;

    setShowAddExerciseModal(false);

    // Show alert asking if user wants to save to template
    Alert.alert(
      "Save to Workout Template?",
      "Do you want to add these exercises to the workout template as well, or just this session?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Session Only",
          onPress: async () => {
            await addExercisesToSession(selectedExercises, false);
          },
        },
        {
          text: "Template + Session",
          onPress: async () => {
            await addExercisesToSession(selectedExercises, true);
          },
        },
      ]
    );
  };

  const addExercisesToSession = async (
    selectedExercises: ExerciseSelectorExercise[],
    saveToTemplate: boolean
  ) => {
    if (!sessionData || !user) return;

    try {
      const currentExerciseCount = sessionData.exercises.length;
      const startOrderIndex = currentExerciseCount;

      // First, add to template if requested
      if (saveToTemplate) {
        for (let i = 0; i < selectedExercises.length; i++) {
          const exercise = selectedExercises[i];
          const orderIndex = startOrderIndex + i;

          // Check if exercise already exists in template
          const { data: existing } = await supabase
            .from("workout_exercises")
            .select("id")
            .eq("workout_id", sessionData.workout_id)
            .eq("exercise_id", exercise.id)
            .single();

          if (!existing) {
            await supabase.from("workout_exercises").insert({
              workout_id: sessionData.workout_id,
              exercise_id: exercise.id,
              order_index: orderIndex,
            });
          }
        }
      }

      // Add to session_exercises
      const sessionExercisesToInsert = selectedExercises.map(
        (exercise, index) => ({
          session_id: sessionData.id,
          exercise_id: exercise.id,
          order_index: startOrderIndex + index,
        })
      );

      const { error: insertError } = await supabase
        .from("session_exercises")
        .insert(sessionExercisesToInsert);

      if (insertError) {
        console.error("Error adding exercises to session:", insertError);
        Alert.alert("Error", "Failed to add exercises");
        return;
      }

      // Refresh session data
      await fetchSessionData();
    } catch (error) {
      console.error("Error adding exercises:", error);
      Alert.alert("Error", "Failed to add exercises");
    }
  };

  const handleRemoveExercise = async (exerciseIndex: number) => {
    if (
      !sessionData ||
      exerciseIndex < 0 ||
      exerciseIndex >= sessionData.exercises.length
    )
      return;

    const exercise = sessionData.exercises[exerciseIndex];
    const progress = exerciseProgress[exerciseIndex];
    const setCount = progress?.sets.length || 0;

    // Show confirmation if exercise has sets
    if (setCount > 0) {
      Alert.alert(
        "Remove Exercise?",
        `This exercise has ${setCount} set${setCount !== 1 ? "s" : ""}. Deleting it will remove all sets. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await removeExerciseFromSession(exerciseIndex, exercise);
            },
          },
        ]
      );
    } else {
      await removeExerciseFromSession(exerciseIndex, exercise);
    }
  };

  const removeExerciseFromSession = async (
    exerciseIndex: number,
    exercise: Exercise
  ) => {
    if (!sessionData) return;

    // If exercise doesn't have sessionExerciseId, it means it's only in template
    // Create a session_exercise entry first, then delete it (to ensure consistency)
    let sessionExerciseId = exercise.sessionExerciseId;

    if (!sessionExerciseId) {
      // Check if it already exists
      const { data: existing } = await supabase
        .from("session_exercises")
        .select("id")
        .eq("session_id", sessionData.id)
        .eq("exercise_id", exercise.id)
        .single();

      if (existing) {
        sessionExerciseId = existing.id;
      } else {
        // Create it first with current order_index
        const { data: inserted, error: insertError } = await supabase
          .from("session_exercises")
          .insert({
            session_id: sessionData.id,
            exercise_id: exercise.id,
            order_index: exerciseIndex,
          })
          .select()
          .single();

        if (insertError || !inserted) {
          console.error("Error creating session exercise:", insertError);
          Alert.alert("Error", "Failed to remove exercise");
          return;
        }

        sessionExerciseId = inserted.id;
      }
    }

    try {
      // Delete sets first (if any)
      const { data: sessionExerciseData } = await supabase
        .from("session_exercises")
        .select("id")
        .eq("id", sessionExerciseId)
        .single();

      if (sessionExerciseData) {
        await supabase
          .from("exercise_sets")
          .delete()
          .eq("session_exercise_id", sessionExerciseData.id);
      }

      // Delete from session_exercises
      const { error: deleteError } = await supabase
        .from("session_exercises")
        .delete()
        .eq("id", sessionExerciseId);

      if (deleteError) {
        console.error("Error removing exercise from session:", deleteError);
        Alert.alert("Error", "Failed to remove exercise");
        return;
      }

      // After deletion, ensure remaining template exercises have session_exercises entries
      // This prevents them from reappearing when we fetch again
      const remainingExercises = sessionData.exercises.filter(
        (_, index) => index !== exerciseIndex
      );

      // Get current session_exercises count to see if we need to create entries
      const { data: remainingSessionExercises } = await supabase
        .from("session_exercises")
        .select("exercise_id")
        .eq("session_id", sessionData.id);

      const remainingSessionExerciseIds = new Set(
        remainingSessionExercises?.map((se) => se.exercise_id) || []
      );

      // Create session_exercises entries for remaining template exercises that don't have them
      const exercisesToAdd = remainingExercises
        .filter(
          (ex) =>
            !ex.sessionExerciseId && !remainingSessionExerciseIds.has(ex.id)
        )
        .map((ex, idx) => {
          // Find the index in the original list (before removal)
          const originalIndex = sessionData.exercises.findIndex(
            (e) => e.id === ex.id
          );
          const adjustedIndex =
            originalIndex < exerciseIndex ? originalIndex : originalIndex - 1;
          return {
            session_id: sessionData.id,
            exercise_id: ex.id,
            order_index: adjustedIndex,
          };
        });

      if (exercisesToAdd.length > 0) {
        await supabase.from("session_exercises").insert(exercisesToAdd);
      }

      // Update local state
      const updatedExercises = remainingExercises;
      const updatedProgress = exerciseProgress.filter(
        (_, index) => index !== exerciseIndex
      );

      setSessionData({
        ...sessionData,
        exercises: updatedExercises,
      });
      setExerciseProgress(updatedProgress);

      // If currently tracking this exercise, go back to list
      if (currentExerciseIndex === exerciseIndex) {
        setCurrentExerciseIndex(null);
      } else if (
        currentExerciseIndex !== null &&
        currentExerciseIndex > exerciseIndex
      ) {
        // Adjust current exercise index if we removed an exercise before it
        setCurrentExerciseIndex(currentExerciseIndex - 1);
      }

      // Refresh to get updated sessionExerciseId values
      await fetchSessionData();
    } catch (error) {
      console.error("Error removing exercise:", error);
      Alert.alert("Error", "Failed to remove exercise");
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

      // Update local state
      setSessionData({
        ...sessionData,
        completed: true,
      });

      // Show "Save as Template?" modal if session has exercises
      if (sessionData.exercises.length > 0 && !sessionData.workout_id) {
        setShowSaveTemplateModal(true);
      } else {
        // Navigate back to home
        router.push("/(tabs)/workouts");
      }
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!sessionData || !user) return;

    try {
      // Create workout from session
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .insert([
          {
            user_id: user.id,
            name: sessionData.name,
            description: null,
          },
        ])
        .select()
        .single();

      if (workoutError) {
        console.error("Error creating workout:", workoutError);
        Alert.alert("Error", "Failed to save as template");
        return;
      }

      // Add exercises to workout
      const workoutExercises = sessionData.exercises.map((exercise, index) => ({
        workout_id: workoutData.id,
        exercise_id: exercise.id,
        order_index: index,
        notes: exercise.notes || null,
      }));

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(workoutExercises);

      if (exercisesError) {
        console.error("Error adding exercises to workout:", exercisesError);
        Alert.alert("Error", "Failed to save exercises to template");
        return;
      }

      // Link session to the new workout
      const { error: linkError } = await supabase
        .from("workout_sessions")
        .update({ workout_id: workoutData.id })
        .eq("id", sessionData.id);

      if (linkError) {
        console.error("Error linking session to workout:", linkError);
        // Non-fatal, continue
      }

      setShowSaveTemplateModal(false);
      Alert.alert("Success", "Session saved as template!", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)/workouts"),
        },
      ]);
    } catch (error) {
      console.error("Error saving as template:", error);
      Alert.alert("Error", "Failed to save as template");
    }
  };

  const handleSkipTemplate = () => {
    setShowSaveTemplateModal(false);
    router.push("/(tabs)/workouts");
  };

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-zinc-900">
        {/* Header */}
        <View
          className="bg-gray-50 dark:bg-zinc-800 px-4 border-b border-gray-200 dark:border-zinc-700"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
            Session
          </Text>
        </View>

        {/* Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">
            Loading session...
          </Text>
        </View>
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View className="flex-1 bg-white dark:bg-zinc-900">
        {/* Header */}
        <View
          className="bg-gray-50 dark:bg-zinc-800 px-4 border-b border-gray-200 dark:border-zinc-700"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
            Session Not Found
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Session not found or you don&apos;t have access to it.
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
        exercise={{
          ...exercise,
          category: exercise.primaryMuscleGroup || "Exercise",
        }}
        onComplete={handleExerciseComplete}
        onBack={handleBackToExercises}
        initialSets={progress.sets}
        lastSessionSets={lastSessionSets}
        onNotesUpdate={handleNotesUpdate}
      />
    );
  }

  // Show exercise list
  return (
    <View className="flex-1 bg-white dark:bg-zinc-900">
      {/* Header */}
      <View
        className="bg-gray-50 dark:bg-zinc-800 px-4 border-b border-gray-200 dark:border-zinc-700"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            {isEditingName ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="text-2xl font-bold text-zinc-900 dark:text-white flex-1"
                  value={editingName}
                  onChangeText={setEditingName}
                  autoFocus
                  onSubmitEditing={() => {
                    if (editingName.trim()) {
                      updateSessionName(editingName);
                    } else {
                      setIsEditingName(false);
                      setEditingName(sessionData.name);
                    }
                  }}
                  onBlur={() => {
                    if (editingName.trim()) {
                      updateSessionName(editingName);
                    } else {
                      setIsEditingName(false);
                      setEditingName(sessionData.name);
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (editingName.trim()) {
                      updateSessionName(editingName);
                    } else {
                      setIsEditingName(false);
                      setEditingName(sessionData.name);
                    }
                  }}
                >
                  <Ionicons name="checkmark" size={20} color="#10b981" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditingName(sessionData.name);
                  setIsEditingName(true);
                }}
                className="flex-row items-center gap-2"
              >
                <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {sessionData.name}
                </Text>
                <Ionicons name="pencil" size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
            <Text className="text-gray-500 dark:text-gray-400 mt-1">
              Started {new Date(sessionData.started_at).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center ${
                exerciseProgress.every((ex) => !ex.completed)
                  ? "bg-gray-100 dark:bg-zinc-700"
                  : "bg-success"
              }`}
              onPress={handleCompleteSession}
              disabled={exerciseProgress.every((ex) => !ex.completed)}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={
                  exerciseProgress.every((ex) => !ex.completed)
                    ? "#9ca3af"
                    : "#002d40"
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-8 h-8 bg-error rounded-full items-center justify-center"
              onPress={handleCancelSession}
            >
              <Ionicons name="trash-outline" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Back Button */}
        <View className="mb-4">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color="#ff4b8c" />
            <Text className="text-primary ml-2 font-medium">
              Back to Sessions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
              Progress
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {exerciseProgress.filter((ex) => ex.completed).length} of{" "}
              {sessionData.exercises.length} completed
            </Text>
          </View>
          <View className="bg-gray-100 dark:bg-zinc-700 rounded-full h-2">
            <View
              className="bg-primary rounded-full h-2"
              style={{
                width: `${sessionData.exercises.length > 0 ? (exerciseProgress.filter((ex) => ex.completed).length / sessionData.exercises.length) * 100 : 0}%`,
              }}
            />
          </View>
          {exerciseProgress.filter((ex) => ex.completed).length ===
            sessionData.exercises.length &&
            sessionData.exercises.length > 0 && (
              <Text className="text-success text-sm font-medium mt-2 text-center">
                🎉 All exercises completed! Ready to finish your session.
              </Text>
            )}
        </View>

        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
              Exercises ({sessionData.exercises.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddExerciseModal(true)}
              className="flex-row items-center px-3 py-1.5 bg-primary rounded-lg"
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text className="text-white font-medium ml-1">Add Exercise</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Tap an exercise to start tracking your sets
          </Text>
        </View>

        {sessionData.exercises.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <View className="w-16 h-16 bg-gray-100 dark:bg-zinc-700 rounded-full items-center justify-center mb-4">
              <Ionicons name="barbell-outline" size={32} color="#ff4b8c" />
            </View>
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              No Exercises
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              This workout template has no exercises
            </Text>
          </View>
        ) : (
          <View>
            {sessionData.exercises.map((exercise, index) => {
              const progress = exerciseProgress[index];
              const isCompleted = progress?.completed;
              const setCount = progress?.sets.length || 0;
              const hasStarted = setCount > 0;

              // Get exercise icon (muscle group agnostic)
              const getExerciseIcon = (): "barbell-outline" => {
                // Use dumbbell icon for all exercises
                return "barbell-outline";
              };

              // Status is now indicated by icon background color and progress bar

              return (
                <View key={exercise.id}>
                  <TouchableOpacity
                    className={`rounded-xl p-4 ${
                      isCompleted
                        ? "bg-success/10 border border-success/20"
                        : hasStarted
                          ? "bg-warning/10 border border-warning/20"
                          : "bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                    }`}
                    onPress={() => handleExerciseClick(index)}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                  >
                    <View className="flex-row items-center">
                      {/* Exercise Icon */}
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                          isCompleted
                            ? "bg-success"
                            : hasStarted
                              ? "bg-warning"
                              : "bg-gray-100 dark:bg-zinc-700"
                        }`}
                      >
                        <Ionicons
                          name={getExerciseIcon()}
                          size={24}
                          color={
                            isCompleted
                              ? "#ffffff"
                              : hasStarted
                                ? "#ffffff"
                                : "#6b7280"
                          }
                        />
                      </View>

                      {/* Exercise Info */}
                      <View className="flex-1">
                        <View className="mb-1">
                          <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {formatExerciseName(exercise.name)}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {exercise.primaryMuscleGroup || "Exercise"}
                          </Text>
                          {setCount > 0 && (
                            <View className="flex-row items-center">
                              <Ionicons
                                name="list-outline"
                                size={14}
                                color="#6b7280"
                              />
                              <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                {setCount} set{setCount !== 1 ? "s" : ""}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Delete Button */}
                      <TouchableOpacity
                        onPress={() => handleRemoveExercise(index)}
                        className="mr-2 p-2"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#ef4444"
                        />
                      </TouchableOpacity>

                      {/* Chevron */}
                      <View className="ml-2">
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                  {index < sessionData.exercises.length - 1 && (
                    <View className="mb-4" />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowAddExerciseModal(false)}
      >
        <ExerciseSelector
          onExerciseSelect={handleAddExercise}
          onClose={() => setShowAddExerciseModal(false)}
          existingExercises={sessionData?.exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            primaryMuscleGroup: ex.primaryMuscleGroup,
          }))}
          title="Add Exercises to Session"
          confirmText="Add"
          showCloseButton={true}
          workoutName={sessionData?.name}
        />
      </Modal>

      {/* Save as Template Modal */}
      <Modal
        visible={showSaveTemplateModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipTemplate}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <View className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Save as Template?
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-6">
              Would you like to save this session as a reusable workout
              template?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-700 items-center"
                onPress={handleSkipTemplate}
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                  Skip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-[#ff4b8c] dark:bg-[#ff6fa1] items-center"
                onPress={handleSaveAsTemplate}
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
