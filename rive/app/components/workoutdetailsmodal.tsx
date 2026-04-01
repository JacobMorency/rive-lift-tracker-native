import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabaseClient";
import {
  addExerciseToTemplate,
  removeExerciseFromTemplate,
} from "../lib/templateUtils";
import ExerciseSelector from "./ExerciseSelector";
import { Exercise, WorkoutDetails } from "./workout/types";
import WorkoutHeader from "./workout/WorkoutHeader";
import WorkoutExerciseList from "./workout/WorkoutExerciseList";

type WorkoutDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string | null;
  onWorkoutUpdated?: () => void;
  onWorkoutDeleted?: () => void;
};

const WorkoutDetailsModal = ({
  isOpen,
  onClose,
  workoutId,
  onWorkoutUpdated,
  onWorkoutDeleted,
}: WorkoutDetailsModalProps) => {
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(
    null,
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
          .select("id, exercise_id, order_index, notes")
          .eq("workout_id", workoutId)
          .order("order_index", { ascending: true });

      if (workoutExercisesError) {
        console.error(
          "Error fetching workout exercises:",
          workoutExercisesError.message,
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
        .select("id, name")
        .in("id", exerciseIds);

      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError.message);
        return;
      }

      console.log("Exercises data:", exercisesData);

      // Fetch muscle groups for all exercises
      const { getExercisesWithMuscleGroups } = await import(
        "../lib/muscleGroupUtils"
      );
      const muscleGroupMap = await getExercisesWithMuscleGroups(exerciseIds);

      // Create a map of exercise IDs to exercise details
      const exerciseMap = new Map();
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

      // Transform the exercises data
      const exercises = workoutExercisesData
        .map((we) => {
          const exercise = exerciseMap.get(we.exercise_id);
          return exercise
            ? {
                id: exercise.id,
                name: exercise.name,
                muscleGroups: exercise.muscleGroups,
                primaryMuscleGroup: exercise.primaryMuscleGroup,
                notes: we.notes || null,
                workoutExerciseId: we.id,
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
            selectedExercises.indexOf(exercise),
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
    exerciseName: string,
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
      ],
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
        prev ? { ...prev, name: editingName.trim() } : null,
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

  const handleNotesUpdate = async (
    workoutExerciseId: string,
    notes: string,
  ) => {
    if (!workoutExerciseId) return;

    try {
      const { error } = await supabase
        .from("workout_exercises")
        .update({ notes: notes.trim() || null })
        .eq("id", workoutExerciseId);

      if (error) {
        console.error("Error updating exercise notes:", error);
        Alert.alert("Error", "Failed to save notes");
        return;
      }

      // Update local state
      setWorkoutDetails((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) =>
            ex.workoutExerciseId === workoutExerciseId
              ? { ...ex, notes: notes.trim() || null }
              : ex,
          ),
        };
      });
    } catch (error) {
      console.error("Error updating exercise notes:", error);
      Alert.alert("Error", "Failed to save notes");
    }
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
      ],
    );
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
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <WorkoutHeader
          workoutDetails={workoutDetails}
          loading={loading}
          isEditingName={isEditingName}
          editingName={editingName}
          setEditingName={setEditingName}
          onEditName={handleEditName}
          onSaveName={handleSaveName}
          onCancelEdit={handleCancelEdit}
          onDeleteWorkout={handleDeleteWorkout}
          onClose={onClose}
        />

        {/* Content */}
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
                Loading workout details...
              </Text>
            </View>
          ) : workoutDetails ? (
            <View className="gap-6">
              {/* Workout Description */}
              {workoutDetails.description && (
                <View className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="document-text" size={16} color="#ff4b8c" />
                    <Text className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Description
                    </Text>
                  </View>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {workoutDetails.description}
                  </Text>
                </View>
              )}

              {/* Exercises Section */}
              <WorkoutExerciseList
                workoutDetails={workoutDetails}
                onRemoveExercise={handleRemoveExercise}
                onNotesUpdate={handleNotesUpdate}
              />
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 dark:text-gray-400">
                Failed to load workout details.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Enhanced Footer Actions */}
        {!loading && workoutDetails && (
          <View
            className="px-4 pt-4 border-t border-gray-200 dark:border-zinc-700"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <TouchableOpacity
              className="bg-[#ff4b8c] dark:bg-[#ff6fa1] py-4 px-6 rounded-xl flex-row items-center justify-center"
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
              <Text className="text-white font-bold ml-2 text-lg">
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
