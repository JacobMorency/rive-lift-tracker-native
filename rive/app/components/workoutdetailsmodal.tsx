import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { supabase } from "../lib/supabaseClient";
import ExerciseSelector from "./exerciseselector";

type Exercise = {
  id: number;
  name: string;
  category: string;
};

type WorkoutDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string | null;
};

type WorkoutDetails = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises: Exercise[];
};

const WorkoutDetailsModal = ({
  isOpen,
  onClose,
  workoutId,
}: WorkoutDetailsModalProps) => {
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  useEffect(() => {
    if (isOpen && workoutId) {
      fetchWorkoutDetails();
    }
  }, [isOpen, workoutId]);

  const fetchWorkoutDetails = async () => {
    if (!workoutId) return;

    setLoading(true);
    try {
      // Fetch workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("id, name, description, created_at")
        .eq("id", workoutId)
        .single();

      if (workoutError) {
        console.error("Error fetching workout details:", workoutError.message);
        return;
      }

      console.log("Workout data:", workoutData);

      // Fetch workout exercises
      const { data: workoutExercisesData, error: workoutExercisesError } =
        await supabase
          .from("workout_exercises")
          .select("exercise_id, order_index")
          .eq("workout_id", workoutId)
          .order("order_index", { ascending: true });

      if (workoutExercisesError) {
        console.error(
          "Error fetching workout exercises:",
          workoutExercisesError.message
        );
        return;
      }

      console.log("Workout exercises data:", workoutExercisesData);

      if (!workoutExercisesData || workoutExercisesData.length === 0) {
        setWorkoutDetails({
          id: workoutData.id,
          name: workoutData.name,
          description: workoutData.description,
          created_at: workoutData.created_at,
          exercises: [],
        });
        return;
      }

      // Get unique exercise IDs
      const exerciseIds = workoutExercisesData.map((we) => we.exercise_id);

      // Fetch exercise details
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_library")
        .select("id, name, category")
        .in("id", exerciseIds);

      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError.message);
        return;
      }

      console.log("Exercises data:", exercisesData);

      // Create a map of exercise IDs to exercise details
      const exerciseMap = new Map();
      exercisesData?.forEach((exercise) => {
        exerciseMap.set(exercise.id, exercise);
      });

      // Transform the exercises data
      const exercises = workoutExercisesData
        .map((we) => {
          const exercise = exerciseMap.get(we.exercise_id);
          return exercise
            ? {
                id: exercise.id,
                name: exercise.name,
                category: exercise.category,
              }
            : null;
        })
        .filter((exercise) => exercise !== null);

      console.log("Exercises:", exercises);

      setWorkoutDetails({
        id: workoutData.id,
        name: workoutData.name,
        description: workoutData.description,
        created_at: workoutData.created_at,
        exercises,
      });
    } catch (error) {
      console.error("Error fetching workout details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercises = () => {
    setShowExerciseSelector(true);
  };

  const handleExerciseSelect = async (selectedExercises: Exercise[]) => {
    if (!workoutId) return;

    try {
      // Add selected exercises to the workout
      const exercisesToAdd = selectedExercises.map((exercise, index) => ({
        workout_id: workoutId,
        exercise_id: exercise.id,
        order_index: (workoutDetails?.exercises.length || 0) + index,
      }));

      const { error } = await supabase
        .from("workout_exercises")
        .insert(exercisesToAdd);

      if (error) {
        console.error("Error adding exercises:", error.message);
        return;
      }

      // Refresh workout details
      await fetchWorkoutDetails();
      setShowExerciseSelector(false);
    } catch (error) {
      console.error("Error adding exercises:", error);
    }
  };

  const handleCloseExerciseSelector = () => {
    setShowExerciseSelector(false);
  };

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!isOpen) return null;

  // Show exercise selector if needed
  if (showExerciseSelector) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <ExerciseSelector
          onExerciseSelect={handleExerciseSelect}
          onClose={handleCloseExerciseSelector}
          existingExercises={workoutDetails?.exercises || []}
          title="Add Exercises"
          confirmText="Add"
          showCloseButton={true}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            {loading ? "Loading..." : workoutDetails?.name || "Workout Details"}
          </Text>
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-gray-600 text-xl">×</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" />
              <Text className="text-gray-600 mt-2">
                Loading workout details...
              </Text>
            </View>
          ) : workoutDetails ? (
            <View className="space-y-4">
              {/* Exercises */}
              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Exercises ({workoutDetails.exercises.length})
                </Text>
                {workoutDetails.exercises.length === 0 ? (
                  <Text className="text-gray-600">
                    No exercises added to this workout.
                  </Text>
                ) : (
                  <View className="space-y-2">
                    {workoutDetails.exercises.map((exercise) => (
                      <View
                        key={exercise.id}
                        className="flex-row items-center py-4 px-3 bg-gray-100 rounded-lg"
                      >
                        <Text className="text-blue-500 mr-3">🏋️</Text>
                        <Text className="flex-1 text-gray-900 font-medium">
                          {formatExerciseName(exercise.name)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-600">
                Failed to load workout details.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        {!loading && workoutDetails && (
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              className="bg-blue-500 py-3 px-4 rounded-lg items-center"
              onPress={handleAddExercises}
            >
              <Text className="text-white font-medium">+ Add Exercises</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default WorkoutDetailsModal;
