import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExerciseSet as StatsExerciseSet } from "../lib/statsUtils";
import { ExerciseSet } from "./exercisetracker/types";
import ProgressComparisonPanel from "./exercisetracker/ProgressComparisonPanel";
import SetInputForm from "./exercisetracker/SetInputForm";
import CompletedSetsList from "./exercisetracker/CompletedSetsList";
import ExerciseNotes from "./exercisetracker/ExerciseNotes";

type Exercise = {
  id: number;
  name: string;
  category: string;
  notes?: string | null;
  workoutExerciseId?: string;
};

type ExerciseTrackerProps = {
  exercise: Exercise;
  onComplete: (sets: ExerciseSet[]) => void;
  onBack: () => void;
  initialSets?: ExerciseSet[];
  lastSessionSets?: StatsExerciseSet[];
  onNotesUpdate?: (notes: string) => void;
};

const ExerciseTracker = ({
  exercise,
  onComplete,
  onBack,
  initialSets = [],
  lastSessionSets = [],
  onNotesUpdate,
}: ExerciseTrackerProps) => {
  const [sets, setSets] = useState<ExerciseSet[]>(initialSets);
  const [currentSet, setCurrentSet] = useState<ExerciseSet>({
    reps: null,
    weight: null,
    partialReps: null,
    set_number: sets.length + 1,
    is_unilateral: false,
    left_reps: null,
    right_reps: null,
  });
  const [weightIncrement, setWeightIncrement] = useState<number>(5);
  const [weightInput, setWeightInput] = useState<string>("");
  const [showAllSets, setShowAllSets] = useState<boolean>(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editingSet, setEditingSet] = useState<ExerciseSet | null>(null);
  const [showPartials, setShowPartials] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const handleAddSet = () => {
    // Check if set is complete based on unilateral setting (allow weight to be 0 for bodyweight)
    const isComplete = currentSet.is_unilateral
      ? currentSet.left_reps !== null &&
        currentSet.right_reps !== null &&
        currentSet.weight !== null &&
        currentSet.weight >= 0
      : currentSet.reps !== null &&
        currentSet.reps !== 0 &&
        currentSet.weight !== null &&
        currentSet.weight >= 0;

    if (!isComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Incomplete Set", "Please enter reps and weight");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newSet = { ...currentSet };
    setSets([...sets, newSet]);

    // Auto-copy last set for next set (smart default)
    const nextSetNumber = sets.length + 2;
    const copiedSet = {
      ...newSet,
      set_number: nextSetNumber,
      // Keep same values to reduce friction
      reps: newSet.reps,
      weight: newSet.weight,
      partialReps: null, // Reset partials for new set
      left_reps: newSet.left_reps,
      right_reps: newSet.right_reps,
    };

    setCurrentSet(copiedSet);
    setWeightInput(newSet.weight !== null ? newSet.weight.toString() : "");
  };

  const handleComplete = () => {
    onComplete(sets);
  };

  const handleCopyLastSet = () => {
    if (sets.length > 0) {
      const lastSet = sets[sets.length - 1];
      setCurrentSet({
        reps: lastSet.reps,
        weight: lastSet.weight,
        partialReps: lastSet.partialReps,
        set_number: sets.length + 1,
        is_unilateral: lastSet.is_unilateral,
        left_reps: lastSet.left_reps,
        right_reps: lastSet.right_reps,
      });
      setWeightInput(lastSet.weight !== null ? lastSet.weight.toString() : "");

      // No auto-focus - users can use buttons
    }
  };

  // Note: weight input is updated directly by button handlers and copy/reset actions

  const removeSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const startEditingSet = (set: ExerciseSet, originalIndex: number) => {
    setEditingSetIndex(originalIndex);
    setEditingSet({ ...set });
  };

  const saveEditedSet = () => {
    if (editingSetIndex !== null && editingSet) {
      // Check if set is complete based on unilateral setting (allow weight to be 0 for bodyweight)
      const isComplete = editingSet.is_unilateral
        ? editingSet.left_reps !== null &&
          editingSet.right_reps !== null &&
          editingSet.weight !== null &&
          editingSet.weight >= 0
        : editingSet.reps !== null &&
          editingSet.reps !== 0 &&
          editingSet.weight !== null &&
          editingSet.weight >= 0;

      if (!isComplete) {
        Alert.alert("Incomplete Set", "Please enter all required values");
        return;
      }

      const newSets = [...sets];
      newSets[editingSetIndex] = { ...editingSet };
      setSets(newSets);
      setEditingSetIndex(null);
      setEditingSet(null);
    }
  };

  const cancelEditingSet = () => {
    setEditingSetIndex(null);
    setEditingSet(null);
  };

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <View className="flex-1 bg-white dark:bg-zinc-900">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-200 dark:border-zinc-700"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
            {formatExerciseName(exercise.name)}
          </Text>
          {exercise.primaryMuscleGroup && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">{exercise.primaryMuscleGroup}</Text>
          )}
        </View>

        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center rounded-full ${
            sets.length === 0 ? "bg-gray-100 dark:bg-zinc-700" : "bg-[#ff4b8c] dark:bg-[#ff6fa1]"
          }`}
          onPress={handleComplete}
          disabled={sets.length === 0}
        >
          <Ionicons
            name="checkmark"
            size={20}
            color={sets.length === 0 ? "#9ca3af" : "#ffffff"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <ProgressComparisonPanel
          lastSessionSets={lastSessionSets}
          currentSet={currentSet}
          sets={sets}
        />

        <ExerciseNotes
          notes={exercise.notes}
          workoutExerciseId={exercise.workoutExerciseId}
          onNotesUpdate={onNotesUpdate || (() => {})}
          exerciseName={formatExerciseName(exercise.name)}
        />

        <SetInputForm
          currentSet={currentSet}
          setCurrentSet={setCurrentSet}
          weightInput={weightInput}
          setWeightInput={setWeightInput}
          weightIncrement={weightIncrement}
          setWeightIncrement={setWeightIncrement}
          showPartials={showPartials}
          setShowPartials={setShowPartials}
          onAddSet={handleAddSet}
          onCopyLastSet={handleCopyLastSet}
          hasSets={sets.length > 0}
        />

        <CompletedSetsList
          sets={sets}
          showAllSets={showAllSets}
          setShowAllSets={setShowAllSets}
          editingSetIndex={editingSetIndex}
          editingSet={editingSet}
          setEditingSet={setEditingSet}
          weightIncrement={weightIncrement}
          onSaveEdit={saveEditedSet}
          onCancelEdit={cancelEditingSet}
          onStartEdit={startEditingSet}
          onRemoveSet={removeSet}
        />
      </ScrollView>
    </View>
  );
};

export default ExerciseTracker;
