import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabaseClient";
import {
  addExerciseToTemplate,
  removeExerciseFromTemplate,
} from "../lib/templateUtils";
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

  const handleAddExercise = () => {
    setShowExerciseSelector(true);
  };

  const handleExerciseSelect = async (selectedExercises: Exercise[]) => {
    if (!workoutId) return;

    try {
      // Use the new utility function to add exercises
      for (const exercise of selectedExercises) {
        await addExerciseToTemplate(
          workoutId,
          exercise.id,
          (workoutDetails?.exercises.length || 0) +
            selectedExercises.indexOf(exercise)
        );
      }

      // Refresh workout details
      await fetchWorkoutDetails();
      setShowExerciseSelector(false);
    } catch (error) {
      console.error("Error adding exercises:", error);
      Alert.alert("Error", "Failed to add exercises to template");
    }
  };

  const handleRemoveExercise = async (
    exerciseId: number,
    exerciseName: string
  ) => {
    if (!workoutId) return;

    Alert.alert(
      "Remove Exercise",
      `Are you sure you want to remove "${formatExerciseName(exerciseName)}" from this template?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeExerciseFromTemplate(workoutId, exerciseId);
              // Refresh workout details
              await fetchWorkoutDetails();
            } catch (error) {
              console.error("Error removing exercise:", error);
              Alert.alert("Error", "Failed to remove exercise from template");
            }
          },
        },
      ]
    );
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
      <View className="flex-1 bg-base-100">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-base-300">
          <Text className="text-lg font-semibold text-base-content">
            {loading
              ? "Loading..."
              : `${workoutDetails?.name || "Workout"} - Manage Exercises`}
          </Text>
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-muted text-xl">×</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-muted mt-2">
                Loading workout details...
              </Text>
            </View>
          ) : workoutDetails ? (
            <View className="space-y-4">
              {/* Exercises */}
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-semibold text-base-content">
                    Exercises ({workoutDetails.exercises.length})
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center px-3 py-1 bg-primary rounded-lg"
                    onPress={handleAddExercise}
                  >
                    <Ionicons name="add" size={16} color="#ffffff" />
                    <Text className="text-primary-content text-sm ml-1">
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                {workoutDetails.exercises.length === 0 ? (
                  <View className="bg-base-200 rounded-lg p-6 items-center">
                    <Ionicons
                      name="barbell-outline"
                      size={32}
                      color="#9ca3af"
                    />
                    <Text className="text-muted mt-2 text-center">
                      No exercises added to this workout.
                    </Text>
                    <Text className="text-muted text-sm text-center mt-1">
                      Tap "Add" to add exercises to this template.
                    </Text>
                  </View>
                ) : (
                  <View>
                    {workoutDetails.exercises.map((exercise, index) => (
                      <View key={exercise.id}>
                        <View
                          className="flex-row items-center py-4 px-3 bg-base-300 rounded-lg"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: {
                              width: 0,
                              height: 1,
                            },
                            shadowOpacity: 0.15,
                            shadowRadius: 2,
                            elevation: 3,
                          }}
                        >
                          <Ionicons
                            name="barbell-outline"
                            size={20}
                            color="#ff4b8c"
                          />
                          <Text className="flex-1 text-base-content font-medium ml-3">
                            {formatExerciseName(exercise.name)}
                          </Text>
                          <TouchableOpacity
                            className="w-8 h-8 bg-error rounded-full items-center justify-center"
                            onPress={() =>
                              handleRemoveExercise(exercise.id, exercise.name)
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color="#ffffff"
                            />
                          </TouchableOpacity>
                        </View>
                        {index < workoutDetails.exercises.length - 1 && (
                          <View className="mb-3" />
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-muted">
                Failed to load workout details.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        {!loading && workoutDetails && (
          <View className="p-4 border-t border-base-300">
            <TouchableOpacity
              className="bg-primary py-3 px-4 rounded-lg items-center"
              onPress={handleAddExercise}
            >
              <Text className="text-primary-content font-medium">
                + Add Exercises
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default WorkoutDetailsModal;
