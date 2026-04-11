import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabaseClient";
import {
  addExerciseToTemplate,
  removeExerciseFromTemplate,
} from "../../lib/templateUtils";
import ExerciseSelector from "../ExerciseSelector";
import { Exercise, WorkoutDetails } from "../workout/types";
import WorkoutExerciseList from "../workout/WorkoutExerciseList";
import AppText from "../ui/AppText";
import AppCard from "../ui/AppCard";
import AppButton from "../ui/AppButton";
import StickyBottomPrimaryButton, {
  STICKY_BOTTOM_PRIMARY_SCROLL_PADDING,
} from "../ui/StickyBottomPrimaryButton";

type WorkoutDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string | null;
  onWorkoutUpdated?: () => void;
  onWorkoutDeleted?: () => void;
};

/** Top bar for this modal only; back + screen title — name/actions live in the scroll content. */
function WorkoutDetailsModalHeader({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className="border-b border-border bg-chrome px-4 dark:border-border-dark dark:bg-chrome-dark"
      style={{ paddingTop: insets.top, paddingBottom: 8 }}
    >
      <View className="min-h-10 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel="Go back"
          className="h-10 w-10 shrink-0 items-center justify-center rounded-full active:opacity-80"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#f5f5f5" : "#111113"}
          />
        </TouchableOpacity>
        <AppText
          variant="subheader"
          tone="default"
          className="min-w-0 flex-1 font-bold tracking-tight"
          numberOfLines={1}
        >
          View Template
        </AppText>
      </View>
    </View>
  );
}

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleDone = () => {
    onWorkoutUpdated?.();
    onClose();
  };

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
        "../../lib/muscleGroupUtils"
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
      <View className="flex-1 bg-background dark:bg-background-dark">
        <WorkoutDetailsModalHeader onClose={onClose} />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            className="flex-1 px-4 pt-4"
            contentContainerStyle={{
              paddingBottom:
                !loading && workoutDetails
                  ? STICKY_BOTTOM_PRIMARY_SCROLL_PADDING + insets.bottom
                  : insets.bottom + 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator
                  size="large"
                  color={isDark ? "#ff6fa1" : "#ff4b8c"}
                />
                <AppText
                  variant="body"
                  tone="muted"
                  className="mt-3 text-center normal-case"
                >
                  Loading workout details...
                </AppText>
              </View>
            ) : workoutDetails ? (
              <View className="gap-6">
                <View className="mb-2">
                  {isEditingName ? (
                    <View className="w-full flex-row items-center gap-2">
                      <TextInput
                        className="min-w-0 flex-1 rounded-ds-control border border-border bg-surfaceAlt px-3 py-2 text-ds-subheader text-text dark:border-border-dark dark:bg-surfaceAlt-dark dark:text-text-dark"
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                        selectTextOnFocus
                        onSubmitEditing={handleSaveName}
                        returnKeyType="done"
                      />
                      <TouchableOpacity
                        onPress={handleSaveName}
                        className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-80 dark:border-border-dark dark:bg-surface-dark"
                        accessibilityLabel="Save name"
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      >
                        <Ionicons
                          name="checkmark"
                          size={22}
                          color={isDark ? "#22c55e" : "#16a34a"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-80 dark:border-border-dark dark:bg-surface-dark"
                        accessibilityLabel="Cancel edit"
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      >
                        <Ionicons
                          name="close"
                          size={22}
                          color={isDark ? "#a1a1aa" : "#6b7280"}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="w-full flex-row items-start gap-3">
                      <TouchableOpacity
                        onPress={handleEditName}
                        activeOpacity={0.85}
                        className="min-w-0 flex-1"
                        accessibilityRole="button"
                        accessibilityLabel="Edit workout name"
                      >
                        <AppText variant="header" tone="default">
                          {workoutDetails.name || "Workout"}
                        </AppText>
                      </TouchableOpacity>
                      <View className="mt-0.5 flex-row items-center gap-1">
                        <TouchableOpacity
                          onPress={handleEditName}
                          className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
                          accessibilityLabel="Edit workout name"
                          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                          <Ionicons
                            name="create-outline"
                            size={24}
                            color={isDark ? "#ff6fa1" : "#ff4b8c"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleDeleteWorkout}
                          className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
                          accessibilityLabel="Delete workout"
                          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  <AppText
                    variant="caption"
                    tone="muted"
                    className="mt-1 normal-case"
                    style={{ letterSpacing: 1 }}
                  >
                    {workoutDetails.exercises.length} exercise
                    {workoutDetails.exercises.length !== 1 ? "s" : ""}
                  </AppText>
                </View>

                {workoutDetails.description ? (
                  <AppCard
                    radius="large"
                    className="border border-primary/10 dark:border-primary-dark/20"
                  >
                    <View className="mb-2 flex-row items-center gap-2">
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color={isDark ? "#ff6fa1" : "#ff4b8c"}
                      />
                      <AppText
                        variant="caption"
                        tone="default"
                        className="font-bold normal-case"
                      >
                        Description
                      </AppText>
                    </View>
                    <AppText
                      variant="body"
                      tone="muted"
                      className="normal-case leading-6"
                    >
                      {workoutDetails.description}
                    </AppText>
                  </AppCard>
                ) : null}

                <AppButton
                  tone="primary"
                  size="lg"
                  fullWidth
                  label="Add exercises"
                  onPress={handleAddExercise}
                  icon={
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color="#ffffff"
                    />
                  }
                  className="shadow-lg shadow-primary/25 dark:shadow-primary-dark/20"
                  accessibilityLabel="Add exercises to template"
                />

                <WorkoutExerciseList
                  workoutDetails={workoutDetails}
                  onRemoveExercise={handleRemoveExercise}
                  onNotesUpdate={handleNotesUpdate}
                />
              </View>
            ) : (
              <View className="items-center justify-center py-8">
                <AppText
                  variant="body"
                  tone="muted"
                  className="text-center normal-case"
                >
                  Failed to load workout details.
                </AppText>
              </View>
            )}
          </ScrollView>

          <StickyBottomPrimaryButton
            visible={!loading && !!workoutDetails}
            label="Done"
            onPress={handleDone}
            accessibilityLabel="Done editing template"
            accessibilityHint="Closes this screen. Your changes are saved as you edit."
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default WorkoutDetailsModal;
