import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  onWorkoutUpdated?: () => void;
  onWorkoutDeleted?: () => void;
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
  onWorkoutUpdated,
  onWorkoutDeleted,
}: WorkoutDetailsModalProps) => {
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const insets = useSafeAreaInsets();

  const fetchWorkoutDetails = useCallback(async () => {
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
  }, [workoutId]);

  useEffect(() => {
    if (isOpen && workoutId) {
      fetchWorkoutDetails();
    }
  }, [isOpen, workoutId, fetchWorkoutDetails]);

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

  const handleEditName = () => {
    if (workoutDetails) {
      setEditingName(workoutDetails.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!workoutId || !editingName.trim()) return;

    try {
      const { error } = await supabase
        .from("workouts")
        .update({ name: editingName.trim() })
        .eq("id", workoutId);

      if (error) {
        console.error("Error updating workout name:", error);
        Alert.alert("Error", "Failed to update workout name");
        return;
      }

      // Update local state
      setWorkoutDetails((prev) =>
        prev ? { ...prev, name: editingName.trim() } : null
      );
      setIsEditingName(false);
      onWorkoutUpdated?.();
    } catch (error) {
      console.error("Error updating workout name:", error);
      Alert.alert("Error", "Failed to update workout name");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditingName("");
  };

  const handleDeleteWorkout = () => {
    if (!workoutDetails) return;

    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${workoutDetails.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("workouts")
                .delete()
                .eq("id", workoutId);

              if (error) {
                console.error("Error deleting workout:", error);
                Alert.alert("Error", "Failed to delete workout");
                return;
              }

              onWorkoutDeleted?.();
              onClose();
            } catch (error) {
              console.error("Error deleting workout:", error);
              Alert.alert("Error", "Failed to delete workout");
            }
          },
        },
      ]
    );
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
        {/* Enhanced Header */}
        <View
          className="bg-base-200 px-4 py-4 border-b border-base-300"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-base-300"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              {isEditingName ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    className="text-xl font-bold text-base-content bg-base-300 px-3 py-1 rounded-lg"
                    value={editingName}
                    onChangeText={setEditingName}
                    autoFocus
                    selectTextOnFocus
                    onSubmitEditing={handleSaveName}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={handleSaveName}
                    className="w-6 h-6 bg-success rounded-full items-center justify-center"
                  >
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className="w-6 h-6 bg-error rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={handleEditName}>
                  <Text className="text-xl font-bold text-base-content">
                    {loading
                      ? "Loading..."
                      : `${workoutDetails?.name || "Workout"}`}
                  </Text>
                </TouchableOpacity>
              )}
              {workoutDetails && (
                <Text className="text-sm text-muted mt-1">
                  {workoutDetails.exercises.length} exercise
                  {workoutDetails.exercises.length !== 1 ? "s" : ""}
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={handleDeleteWorkout}
                className="w-10 h-10 items-center justify-center rounded-full bg-error/20"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Workout Info */}
          {workoutDetails && workoutDetails.description && (
            <View className="bg-base-300 rounded-lg p-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="document-text" size={14} color="#9ca3af" />
                <Text className="text-xs text-muted">Has description</Text>
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-muted mt-3 text-center">
                Loading workout details...
              </Text>
            </View>
          ) : workoutDetails ? (
            <View className="gap-6">
              {/* Workout Description */}
              {workoutDetails.description && (
                <View className="bg-base-200 rounded-xl p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="document-text" size={16} color="#ff4b8c" />
                    <Text className="text-sm font-semibold text-base-content">
                      Description
                    </Text>
                  </View>
                  <Text className="text-muted text-sm">
                    {workoutDetails.description}
                  </Text>
                </View>
              )}

              {/* Exercises Section */}
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-base-content">
                    Exercises
                  </Text>
                  <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-sm font-medium text-primary">
                      {workoutDetails.exercises.length} total
                    </Text>
                  </View>
                </View>

                {workoutDetails.exercises.length === 0 ? (
                  <View className="bg-base-200 rounded-xl p-8 items-center">
                    <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
                      <Ionicons
                        name="barbell-outline"
                        size={40}
                        color="#9ca3af"
                      />
                    </View>
                    <Text className="text-xl font-bold text-base-content mb-2">
                      No Exercises Yet
                    </Text>
                    <Text className="text-muted text-center mb-6 max-w-xs">
                      This workout template is empty. Add some exercises to get
                      started!
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="arrow-down" size={16} color="#ff4b8c" />
                      <Text className="text-sm font-medium text-primary">
                        Tap &quot;Add Exercises&quot; below
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className="gap-3">
                    {workoutDetails.exercises.map((exercise, index) => (
                      <View
                        key={exercise.id}
                        className="bg-base-200 rounded-xl p-4"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        <View className="flex-row items-center gap-4">
                          <View className="w-10 h-10 bg-primary/20 rounded-xl items-center justify-center">
                            <Ionicons
                              name="barbell-outline"
                              size={20}
                              color="#ff4b8c"
                            />
                          </View>

                          <View className="flex-1">
                            <Text className="text-lg font-semibold text-base-content">
                              {formatExerciseName(exercise.name)}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1">
                              <View className="bg-base-300 px-2 py-1 rounded-full">
                                <Text className="text-xs text-muted">
                                  {exercise.category}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <TouchableOpacity
                            className="w-10 h-10 bg-error/20 rounded-xl items-center justify-center"
                            onPress={() =>
                              handleRemoveExercise(exercise.id, exercise.name)
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#ef4444"
                            />
                          </TouchableOpacity>
                        </View>
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

        {/* Enhanced Footer Actions */}
        {!loading && workoutDetails && (
          <View
            className="px-4 pt-4 border-t border-base-300"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <TouchableOpacity
              className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-center"
              onPress={handleAddExercise}
              style={{
                shadowColor: "#ff4b8c",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text className="text-primary-content font-bold ml-2 text-lg">
                Add Exercises
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default WorkoutDetailsModal;
