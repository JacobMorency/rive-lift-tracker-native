import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Alert, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExerciseSet as StatsExerciseSet } from "../lib/statsUtils";
import { ExerciseSet } from "./exercisetracker/types";
import ProgressComparisonPanel from "./exercisetracker/ProgressComparisonPanel";
import SetInputForm from "./exercisetracker/SetInputForm";
import CompletedSetsList from "./exercisetracker/CompletedSetsList";
import ExerciseNotes from "./exercisetracker/ExerciseNotes";
import AppText from "./ui/AppText";

type Exercise = {
  id: number;
  name: string;
  category: string;
  primaryMuscleGroup?: string;
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconMuted = isDark ? "#a3a3a3" : "#737373";
  const iconStrong = isDark ? "#f5f5f5" : "#111113";

  const handleAddSet = () => {
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

    const nextSetNumber = sets.length + 2;
    const copiedSet = {
      ...newSet,
      set_number: nextSetNumber,
      reps: newSet.reps,
      weight: newSet.weight,
      partialReps: null,
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
    }
  };

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

  const title = formatExerciseName(exercise.name);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View
        className="border-b border-border dark:border-border-dark px-4"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Back"
            className="w-10 h-10 items-center justify-center rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark active:opacity-80"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={iconStrong} />
          </TouchableOpacity>

          <View className="flex-1 min-w-0">
            <AppText variant="caption" tone="primary" className="mb-0.5">
              Back
            </AppText>
            <AppText
              variant="subheader"
              tone="default"
              numberOfLines={1}
              className="font-bold"
            >
              {title}
            </AppText>
            {exercise.primaryMuscleGroup ? (
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {exercise.primaryMuscleGroup}
              </AppText>
            ) : null}
          </View>

          <TouchableOpacity
            className={`w-10 h-10 items-center justify-center rounded-full ${
              sets.length === 0
                ? "bg-surfaceAlt dark:bg-surfaceAlt-dark"
                : "bg-primary dark:bg-primary-dark"
            }`}
            onPress={handleComplete}
            disabled={sets.length === 0}
            accessibilityLabel="Complete exercise"
          >
            <Ionicons
              name="checkmark"
              size={22}
              color={sets.length === 0 ? iconMuted : "#ffffff"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
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
          exerciseName={title}
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
