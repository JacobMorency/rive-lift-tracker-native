import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExerciseSet as StatsExerciseSet } from "../lib/statsUtils";

type Exercise = {
  id: number;
  name: string;
  category: string;
};

type ExerciseSet = {
  id?: string;
  reps: number | null;
  weight: number | null;
  partialReps: number | null;
  set_number: number;
  is_unilateral?: boolean;
  left_reps?: number | null;
  right_reps?: number | null;
};

type ExerciseTrackerProps = {
  exercise: Exercise;
  onComplete: (sets: ExerciseSet[]) => void;
  onBack: () => void;
  initialSets?: ExerciseSet[];
  lastSessionSets?: StatsExerciseSet[];
};

const ExerciseTracker = ({
  exercise,
  onComplete,
  onBack,
  initialSets = [],
  lastSessionSets = [],
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
  const [showAllSets, setShowAllSets] = useState<boolean>(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editingSet, setEditingSet] = useState<ExerciseSet | null>(null);
  const insets = useSafeAreaInsets();

  // No refs needed - users will use buttons instead of keyboard navigation

  const handleAddSet = () => {
    // Check if set is complete based on unilateral setting
    const isComplete = currentSet.is_unilateral
      ? currentSet.left_reps !== null &&
        currentSet.right_reps !== null &&
        currentSet.weight !== null
      : currentSet.reps !== null &&
        currentSet.weight !== null &&
        currentSet.reps !== 0;

    if (!isComplete) {
      Alert.alert("Incomplete Set", "Please enter reps and weight");
      return;
    }

    const newSet = { ...currentSet };
    setSets([...sets, newSet]);

    // Reset for next set
    setCurrentSet({
      reps: null,
      weight: null,
      partialReps: null,
      set_number: sets.length + 2,
      is_unilateral: currentSet.is_unilateral, // Keep the same unilateral setting
      left_reps: null,
      right_reps: null,
    });

    // No auto-focus - users can use buttons
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

      // No auto-focus - users can use buttons
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
      // Check if set is complete based on unilateral setting
      const isComplete = editingSet.is_unilateral
        ? editingSet.left_reps !== null &&
          editingSet.right_reps !== null &&
          editingSet.weight !== null
        : editingSet.reps !== null &&
          editingSet.weight !== null &&
          editingSet.reps !== 0;

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

  // Get sets to display (last 3 or all if showAllSets is true, in reverse order)
  const getDisplaySets = () => {
    if (!sets || sets.length === 0) return [];
    const allSets = [...sets].reverse().filter((set) => set != null); // Reverse to show latest first and filter out null/undefined
    if (sets.length <= 3 || showAllSets) {
      return allSets;
    }
    return allSets.slice(0, 3); // First 3 of reversed array (latest 3)
  };

  return (
    <View className="flex-1 bg-base-100">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-base-content">
            {formatExerciseName(exercise.name)}
          </Text>
          <Text className="text-sm text-muted">{exercise.category}</Text>
        </View>

        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center rounded-full ${
            sets.length === 0 ? "bg-base-300" : "bg-primary"
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
        {/* Last Session Data */}
        {lastSessionSets.length > 0 && (
          <View
            className="bg-base-300 rounded-xl p-4 mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-sm font-semibold text-base-content ml-2">
                Last Session
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {lastSessionSets.map((set, index) => (
                <View key={index} className="bg-base-200 px-3 py-2 rounded-lg">
                  <Text className="text-xs text-muted">Set {index + 1}</Text>
                  <Text className="text-sm font-semibold text-base-content">
                    {set.weight || 0} lbs ×{" "}
                    {set.is_unilateral
                      ? `${set.left_reps || 0}L + ${set.right_reps || 0}R`
                      : set.reps || 0}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Current Set Input */}
        <View
          className="bg-base-200 rounded-xl p-6 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="mb-6">
            <Text className="text-lg font-bold text-base-content">
              Set {currentSet.set_number}
            </Text>
            <Text className="text-sm text-muted">
              Enter your reps and weight
            </Text>
          </View>

          <View className="gap-4">
            {/* Reps - Conditional based on unilateral */}
            {currentSet.is_unilateral ? (
              <View className="flex-row gap-3">
                {/* Left Reps */}
                <View className="flex-1">
                  <View className="mb-2">
                    <Text className="text-sm font-semibold text-base-content">
                      L Reps
                    </Text>
                  </View>
                  <View
                    className={`rounded-xl flex-row items-center ${
                      currentSet.left_reps !== null && currentSet.left_reps > 0
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-base-300 border-2 border-transparent"
                    }`}
                  >
                    <TouchableOpacity
                      className="px-3 py-3"
                      onPress={() => {
                        const newValue = (currentSet.left_reps || 0) - 1;
                        if (newValue >= 0) {
                          setCurrentSet({ ...currentSet, left_reps: newValue });
                        }
                      }}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={
                          currentSet.left_reps !== null &&
                          currentSet.left_reps > 0
                            ? "#ff4b8c"
                            : "#6b7280"
                        }
                      />
                    </TouchableOpacity>
                    <TextInput
                      className="flex-1 text-center py-3 text-base font-bold text-base-content"
                      value={
                        currentSet.left_reps !== null
                          ? currentSet.left_reps.toString()
                          : ""
                      }
                      onChangeText={(value) => {
                        if (value === "" || value === "-") {
                          setCurrentSet({ ...currentSet, left_reps: null });
                        } else {
                          const parsed = parseInt(value);
                          if (!isNaN(parsed)) {
                            setCurrentSet({ ...currentSet, left_reps: parsed });
                          }
                        }
                      }}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                    <TouchableOpacity
                      className="px-3 py-3"
                      onPress={() =>
                        setCurrentSet({
                          ...currentSet,
                          left_reps: (currentSet.left_reps || 0) + 1,
                        })
                      }
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={
                          currentSet.left_reps !== null &&
                          currentSet.left_reps > 0
                            ? "#ff4b8c"
                            : "#6b7280"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Right Reps */}
                <View className="flex-1">
                  <View className="mb-2">
                    <Text className="text-sm font-semibold text-base-content">
                      R Reps
                    </Text>
                  </View>
                  <View
                    className={`rounded-xl flex-row items-center ${
                      currentSet.right_reps !== null &&
                      currentSet.right_reps > 0
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-base-300 border-2 border-transparent"
                    }`}
                  >
                    <TouchableOpacity
                      className="px-3 py-3"
                      onPress={() => {
                        const newValue = (currentSet.right_reps || 0) - 1;
                        if (newValue >= 0) {
                          setCurrentSet({
                            ...currentSet,
                            right_reps: newValue,
                          });
                        }
                      }}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={
                          currentSet.right_reps !== null &&
                          currentSet.right_reps > 0
                            ? "#ff4b8c"
                            : "#6b7280"
                        }
                      />
                    </TouchableOpacity>
                    <TextInput
                      className="flex-1 text-center py-3 text-base font-bold text-base-content"
                      value={
                        currentSet.right_reps !== null
                          ? currentSet.right_reps.toString()
                          : ""
                      }
                      onChangeText={(value) => {
                        if (value === "" || value === "-") {
                          setCurrentSet({ ...currentSet, right_reps: null });
                        } else {
                          const parsed = parseInt(value);
                          if (!isNaN(parsed)) {
                            setCurrentSet({
                              ...currentSet,
                              right_reps: parsed,
                            });
                          }
                        }
                      }}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                    <TouchableOpacity
                      className="px-3 py-3"
                      onPress={() =>
                        setCurrentSet({
                          ...currentSet,
                          right_reps: (currentSet.right_reps || 0) + 1,
                        })
                      }
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={
                          currentSet.right_reps !== null &&
                          currentSet.right_reps > 0
                            ? "#ff4b8c"
                            : "#6b7280"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              /* Regular Reps */
              <View className="flex-1">
                <View className="mb-2">
                  <Text className="text-sm font-semibold text-base-content">
                    Reps
                  </Text>
                </View>
                <View
                  className={`rounded-xl flex-row items-center ${
                    currentSet.reps !== null && currentSet.reps > 0
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-base-300 border-2 border-transparent"
                  }`}
                >
                  <TouchableOpacity
                    className="px-4 py-3"
                    onPress={() => {
                      const newValue = (currentSet.reps || 0) - 1;
                      if (newValue >= 0) {
                        setCurrentSet({ ...currentSet, reps: newValue });
                      }
                    }}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={
                        currentSet.reps !== null && currentSet.reps > 0
                          ? "#ff4b8c"
                          : "#6b7280"
                      }
                    />
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 text-center py-3 text-lg font-bold text-base-content"
                    value={
                      currentSet.reps !== null ? currentSet.reps.toString() : ""
                    }
                    onChangeText={(value) => {
                      if (value === "" || value === "-") {
                        setCurrentSet({ ...currentSet, reps: null });
                      } else {
                        const parsed = parseInt(value);
                        if (!isNaN(parsed)) {
                          setCurrentSet({ ...currentSet, reps: parsed });
                        }
                      }
                    }}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                  <TouchableOpacity
                    className="px-4 py-3"
                    onPress={() =>
                      setCurrentSet({
                        ...currentSet,
                        reps: (currentSet.reps || 0) + 1,
                      })
                    }
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={
                        currentSet.reps !== null && currentSet.reps > 0
                          ? "#ff4b8c"
                          : "#6b7280"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Weight */}
            <View className="flex-1">
              <View className="mb-2">
                <Text className="text-sm font-semibold text-base-content">
                  Weight (lbs)
                </Text>
              </View>
              <View
                className={`rounded-xl flex-row items-center ${
                  currentSet.weight !== null
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-base-300 border-2 border-transparent"
                }`}
              >
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() => {
                    const newValue = (currentSet.weight || 0) - weightIncrement;
                    if (newValue >= 0) {
                      setCurrentSet({ ...currentSet, weight: newValue });
                    }
                  }}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={currentSet.weight !== null ? "#ff4b8c" : "#6b7280"}
                  />
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center py-3 text-lg font-bold text-base-content"
                  value={
                    currentSet.weight !== null
                      ? currentSet.weight.toString()
                      : ""
                  }
                  onChangeText={(value) => {
                    if (value === "" || value === "-" || value === ".") {
                      setCurrentSet({ ...currentSet, weight: null });
                    } else {
                      const parsed = parseFloat(value);
                      if (!isNaN(parsed)) {
                        const rounded = Math.floor(parsed * 10) / 10;
                        setCurrentSet({ ...currentSet, weight: rounded });
                      }
                    }
                  }}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() =>
                    setCurrentSet({
                      ...currentSet,
                      weight: (currentSet.weight || 0) + weightIncrement,
                    })
                  }
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={currentSet.weight !== null ? "#ff4b8c" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Partial Reps */}
            <View className="flex-1">
              <View className="mb-2">
                <Text className="text-sm font-semibold text-base-content">
                  Partials
                </Text>
              </View>
              <View
                className={`rounded-xl flex-row items-center ${
                  currentSet.partialReps !== null && currentSet.partialReps > 0
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-base-300 border-2 border-transparent"
                }`}
              >
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() => {
                    const newValue = (currentSet.partialReps || 0) - 1;
                    if (newValue >= 0) {
                      setCurrentSet({ ...currentSet, partialReps: newValue });
                    }
                  }}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={
                      currentSet.partialReps !== null &&
                      currentSet.partialReps > 0
                        ? "#ff4b8c"
                        : "#6b7280"
                    }
                  />
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center py-3 text-lg font-bold text-base-content"
                  value={
                    currentSet.partialReps !== null
                      ? currentSet.partialReps.toString()
                      : ""
                  }
                  onChangeText={(value) => {
                    if (value === "" || value === "-") {
                      setCurrentSet({ ...currentSet, partialReps: null });
                    } else {
                      const parsed = parseInt(value);
                      if (!isNaN(parsed)) {
                        setCurrentSet({ ...currentSet, partialReps: parsed });
                      }
                    }
                  }}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() =>
                    setCurrentSet({
                      ...currentSet,
                      partialReps: (currentSet.partialReps || 0) + 1,
                    })
                  }
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={
                      currentSet.partialReps !== null &&
                      currentSet.partialReps > 0
                        ? "#ff4b8c"
                        : "#6b7280"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Weight Increment Tabs */}
          <View className="mt-6">
            <Text className="text-sm font-semibold text-base-content mb-3">
              Weight Increment
            </Text>
            <View className="flex-row bg-base-300 rounded-xl p-1">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  weightIncrement === 2.5 ? "bg-primary" : "bg-transparent"
                }`}
                onPress={() => setWeightIncrement(2.5)}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    weightIncrement === 2.5
                      ? "text-primary-content"
                      : "text-base-content"
                  }`}
                >
                  2.5 lbs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  weightIncrement === 5 ? "bg-primary" : "bg-transparent"
                }`}
                onPress={() => setWeightIncrement(5)}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    weightIncrement === 5
                      ? "text-primary-content"
                      : "text-base-content"
                  }`}
                >
                  5 lbs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  weightIncrement === 10 ? "bg-primary" : "bg-transparent"
                }`}
                onPress={() => setWeightIncrement(10)}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    weightIncrement === 10
                      ? "text-primary-content"
                      : "text-base-content"
                  }`}
                >
                  10 lbs
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Unilateral Toggle */}
          <View className="mt-6">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                className={`w-6 h-6 rounded border-2 items-center justify-center ${
                  currentSet.is_unilateral
                    ? "bg-primary border-primary"
                    : "border-base-content/30"
                }`}
                onPress={() =>
                  setCurrentSet({
                    ...currentSet,
                    is_unilateral: !currentSet.is_unilateral,
                  })
                }
              >
                {currentSet.is_unilateral && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
              <Text className="text-sm text-base-content">
                Unilateral (L/R)
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              className={`flex-1 py-4 rounded-xl flex-row items-center justify-center ${
                currentSet.is_unilateral
                  ? currentSet.left_reps === null ||
                    currentSet.right_reps === null ||
                    currentSet.weight === null
                    ? "bg-base-300"
                    : "bg-primary"
                  : currentSet.reps === null ||
                      currentSet.weight === null ||
                      currentSet.reps === 0
                    ? "bg-base-300"
                    : "bg-primary"
              }`}
              onPress={handleAddSet}
              disabled={
                currentSet.is_unilateral
                  ? currentSet.left_reps === null ||
                    currentSet.right_reps === null ||
                    currentSet.weight === null
                  : currentSet.reps === null ||
                    currentSet.weight === null ||
                    currentSet.reps === 0
              }
              style={{
                shadowColor: currentSet.is_unilateral
                  ? currentSet.left_reps !== null &&
                    currentSet.right_reps !== null &&
                    currentSet.weight !== null
                    ? "#ff4b8c"
                    : "#000"
                  : currentSet.reps !== null &&
                      currentSet.weight !== null &&
                      currentSet.reps > 0
                    ? "#ff4b8c"
                    : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: currentSet.is_unilateral
                  ? currentSet.left_reps !== null &&
                    currentSet.right_reps !== null &&
                    currentSet.weight !== null
                    ? 0.3
                    : 0.1
                  : currentSet.reps !== null &&
                      currentSet.weight !== null &&
                      currentSet.reps > 0
                    ? 0.3
                    : 0.1,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Ionicons
                name="add-circle"
                size={20}
                color={
                  currentSet.is_unilateral
                    ? currentSet.left_reps === null ||
                      currentSet.right_reps === null ||
                      currentSet.weight === null
                      ? "#6b7280"
                      : "#ffffff"
                    : currentSet.reps === null ||
                        currentSet.weight === null ||
                        currentSet.reps === 0
                      ? "#6b7280"
                      : "#ffffff"
                }
              />
              <Text
                className={`text-center font-bold ml-2 ${
                  currentSet.is_unilateral
                    ? currentSet.left_reps === null ||
                      currentSet.right_reps === null ||
                      currentSet.weight === null
                      ? "text-muted"
                      : "text-primary-content"
                    : currentSet.reps === null ||
                        currentSet.weight === null ||
                        currentSet.reps === 0
                      ? "text-muted"
                      : "text-primary-content"
                }`}
              >
                Add Set
              </Text>
            </TouchableOpacity>
            {sets.length > 0 && (
              <TouchableOpacity
                className="px-6 py-4 border-2 border-primary rounded-xl flex-row items-center bg-primary/5"
                onPress={handleCopyLastSet}
                style={{
                  shadowColor: "#ff4b8c",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="copy-outline" size={20} color="#ff4b8c" />
                <Text className="text-primary text-center ml-2 font-semibold">
                  Copy Last
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Completed Sets */}
        {sets.length > 0 && (
          <View
            className="bg-base-200 rounded-xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text className="text-lg font-bold text-base-content ml-2">
                  Completed Sets
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="bg-success/10 px-3 py-1 rounded-full">
                  <Text className="text-success text-sm font-bold">
                    {sets.length}
                  </Text>
                </View>
                {sets.length > 3 && (
                  <TouchableOpacity
                    onPress={() => setShowAllSets(!showAllSets)}
                    className="bg-base-300 px-3 py-1 rounded-full"
                  >
                    <View className="flex-row items-center gap-1">
                      <Text className="text-base-content text-sm font-medium">
                        {showAllSets ? "Show Less" : "Show All"}
                      </Text>
                      <Ionicons
                        name={showAllSets ? "chevron-up" : "chevron-down"}
                        size={14}
                        color="#6b7280"
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View className="gap-3">
              {getDisplaySets().map((set, index) => {
                // Safety check for undefined/null set
                if (!set) return null;

                // Find the original index for proper removal
                const originalIndex = sets.findIndex((s) => s === set);
                const isEditing = editingSetIndex === originalIndex;

                return (
                  <View
                    key={index}
                    className="bg-base-300 rounded-xl p-4"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    {isEditing ? (
                      // Edit Mode
                      <View className="gap-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <View className="bg-warning w-8 h-8 rounded-full items-center justify-center">
                              <Text className="text-white text-sm font-bold">
                                {editingSet?.set_number || 0}
                              </Text>
                            </View>
                            <Text className="text-sm font-semibold text-base-content">
                              Editing Set
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={saveEditedSet}
                              disabled={
                                editingSet?.is_unilateral
                                  ? editingSet?.left_reps === null ||
                                    editingSet?.right_reps === null ||
                                    editingSet?.weight === null
                                  : editingSet?.reps === null ||
                                    editingSet?.weight === null ||
                                    editingSet?.reps === 0
                              }
                              className={`w-8 h-8 items-center justify-center rounded-full ${
                                editingSet?.is_unilateral
                                  ? editingSet?.left_reps === null ||
                                    editingSet?.right_reps === null ||
                                    editingSet?.weight === null
                                    ? "bg-base-300"
                                    : "bg-success"
                                  : editingSet?.reps === null ||
                                      editingSet?.weight === null ||
                                      editingSet?.reps === 0
                                    ? "bg-base-300"
                                    : "bg-success"
                              }`}
                            >
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#ffffff"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={cancelEditingSet}
                              className="w-8 h-8 items-center justify-center rounded-full bg-base-300"
                            >
                              <Ionicons
                                name="close"
                                size={16}
                                color="#6b7280"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View className="gap-3">
                          {/* Edit Reps - Conditional based on unilateral */}
                          {editingSet?.is_unilateral ? (
                            <View className="flex-row gap-3">
                              {/* Edit Left Reps */}
                              <View className="flex-1">
                                <Text className="text-xs text-muted mb-1">
                                  L Reps
                                </Text>
                                <View className="flex-row items-center bg-base-200 rounded-lg">
                                  <TouchableOpacity
                                    className="px-2 py-2"
                                    onPress={() => {
                                      if (editingSet) {
                                        const newValue =
                                          (editingSet.left_reps || 0) - 1;
                                        if (newValue >= 0) {
                                          setEditingSet({
                                            ...editingSet,
                                            left_reps: newValue,
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Ionicons
                                      name="remove"
                                      size={14}
                                      color="#6b7280"
                                    />
                                  </TouchableOpacity>
                                  <TextInput
                                    className="flex-1 text-center py-2 text-sm font-bold text-base-content"
                                    value={
                                      editingSet?.left_reps?.toString() || ""
                                    }
                                    onChangeText={(value) => {
                                      if (editingSet) {
                                        if (value === "" || value === "-") {
                                          setEditingSet({
                                            ...editingSet,
                                            left_reps: null,
                                          });
                                        } else {
                                          const parsed = parseInt(value);
                                          if (!isNaN(parsed)) {
                                            setEditingSet({
                                              ...editingSet,
                                              left_reps: parsed,
                                            });
                                          }
                                        }
                                      }
                                    }}
                                    placeholder="0"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    blurOnSubmit={true}
                                  />
                                  <TouchableOpacity
                                    className="px-2 py-2"
                                    onPress={() => {
                                      if (editingSet) {
                                        setEditingSet({
                                          ...editingSet,
                                          left_reps:
                                            (editingSet.left_reps || 0) + 1,
                                        });
                                      }
                                    }}
                                  >
                                    <Ionicons
                                      name="add"
                                      size={14}
                                      color="#6b7280"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                              {/* Edit Right Reps */}
                              <View className="flex-1">
                                <Text className="text-xs text-muted mb-1">
                                  R Reps
                                </Text>
                                <View className="flex-row items-center bg-base-200 rounded-lg">
                                  <TouchableOpacity
                                    className="px-2 py-2"
                                    onPress={() => {
                                      if (editingSet) {
                                        const newValue =
                                          (editingSet.right_reps || 0) - 1;
                                        if (newValue >= 0) {
                                          setEditingSet({
                                            ...editingSet,
                                            right_reps: newValue,
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Ionicons
                                      name="remove"
                                      size={14}
                                      color="#6b7280"
                                    />
                                  </TouchableOpacity>
                                  <TextInput
                                    className="flex-1 text-center py-2 text-sm font-bold text-base-content"
                                    value={
                                      editingSet?.right_reps?.toString() || ""
                                    }
                                    onChangeText={(value) => {
                                      if (editingSet) {
                                        if (value === "" || value === "-") {
                                          setEditingSet({
                                            ...editingSet,
                                            right_reps: null,
                                          });
                                        } else {
                                          const parsed = parseInt(value);
                                          if (!isNaN(parsed)) {
                                            setEditingSet({
                                              ...editingSet,
                                              right_reps: parsed,
                                            });
                                          }
                                        }
                                      }
                                    }}
                                    placeholder="0"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    blurOnSubmit={true}
                                  />
                                  <TouchableOpacity
                                    className="px-2 py-2"
                                    onPress={() => {
                                      if (editingSet) {
                                        setEditingSet({
                                          ...editingSet,
                                          right_reps:
                                            (editingSet.right_reps || 0) + 1,
                                        });
                                      }
                                    }}
                                  >
                                    <Ionicons
                                      name="add"
                                      size={14}
                                      color="#6b7280"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          ) : (
                            /* Edit Regular Reps */
                            <View>
                              <Text className="text-xs text-muted mb-1">
                                Reps
                              </Text>
                              <View className="flex-row items-center bg-base-200 rounded-lg">
                                <TouchableOpacity
                                  className="px-3 py-2"
                                  onPress={() => {
                                    if (editingSet) {
                                      const newValue =
                                        (editingSet.reps || 0) - 1;
                                      if (newValue >= 0) {
                                        setEditingSet({
                                          ...editingSet,
                                          reps: newValue,
                                        });
                                      }
                                    }
                                  }}
                                >
                                  <Ionicons
                                    name="remove"
                                    size={16}
                                    color="#6b7280"
                                  />
                                </TouchableOpacity>
                                <TextInput
                                  className="flex-1 text-center py-2 text-base font-bold text-base-content"
                                  value={editingSet?.reps?.toString() || ""}
                                  onChangeText={(value) => {
                                    if (editingSet) {
                                      if (value === "" || value === "-") {
                                        setEditingSet({
                                          ...editingSet,
                                          reps: null,
                                        });
                                      } else {
                                        const parsed = parseInt(value);
                                        if (!isNaN(parsed)) {
                                          setEditingSet({
                                            ...editingSet,
                                            reps: parsed,
                                          });
                                        }
                                      }
                                    }
                                  }}
                                  placeholder="0"
                                  placeholderTextColor="#9ca3af"
                                  keyboardType="numeric"
                                  returnKeyType="done"
                                  blurOnSubmit={true}
                                />
                                <TouchableOpacity
                                  className="px-3 py-2"
                                  onPress={() => {
                                    if (editingSet) {
                                      setEditingSet({
                                        ...editingSet,
                                        reps: (editingSet.reps || 0) + 1,
                                      });
                                    }
                                  }}
                                >
                                  <Ionicons
                                    name="add"
                                    size={16}
                                    color="#6b7280"
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}

                          {/* Edit Weight */}
                          <View>
                            <Text className="text-xs text-muted mb-1">
                              Weight (lbs)
                            </Text>
                            <View className="flex-row items-center bg-base-200 rounded-lg">
                              <TouchableOpacity
                                className="px-3 py-2"
                                onPress={() => {
                                  if (editingSet) {
                                    const newValue =
                                      (editingSet.weight || 0) -
                                      weightIncrement;
                                    if (newValue >= 0) {
                                      setEditingSet({
                                        ...editingSet,
                                        weight: newValue,
                                      });
                                    }
                                  }
                                }}
                              >
                                <Ionicons
                                  name="remove"
                                  size={16}
                                  color="#6b7280"
                                />
                              </TouchableOpacity>
                              <TextInput
                                className="flex-1 text-center py-2 text-base font-bold text-base-content"
                                value={editingSet?.weight?.toString() || ""}
                                onChangeText={(value) => {
                                  if (editingSet) {
                                    if (
                                      value === "" ||
                                      value === "-" ||
                                      value === "."
                                    ) {
                                      setEditingSet({
                                        ...editingSet,
                                        weight: null,
                                      });
                                    } else {
                                      const parsed = parseFloat(value);
                                      if (!isNaN(parsed)) {
                                        const rounded =
                                          Math.floor(parsed * 10) / 10;
                                        setEditingSet({
                                          ...editingSet,
                                          weight: rounded,
                                        });
                                      }
                                    }
                                  }
                                }}
                                placeholder="0"
                                placeholderTextColor="#9ca3af"
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                                blurOnSubmit={true}
                              />
                              <TouchableOpacity
                                className="px-3 py-2"
                                onPress={() => {
                                  if (editingSet) {
                                    setEditingSet({
                                      ...editingSet,
                                      weight:
                                        (editingSet.weight || 0) +
                                        weightIncrement,
                                    });
                                  }
                                }}
                              >
                                <Ionicons
                                  name="add"
                                  size={16}
                                  color="#6b7280"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Edit Partials */}
                          <View>
                            <Text className="text-xs text-muted mb-1">
                              Partials
                            </Text>
                            <View className="flex-row items-center bg-base-200 rounded-lg">
                              <TouchableOpacity
                                className="px-3 py-2"
                                onPress={() => {
                                  if (editingSet) {
                                    const newValue =
                                      (editingSet.partialReps || 0) - 1;
                                    if (newValue >= 0) {
                                      setEditingSet({
                                        ...editingSet,
                                        partialReps: newValue,
                                      });
                                    }
                                  }
                                }}
                              >
                                <Ionicons
                                  name="remove"
                                  size={16}
                                  color="#6b7280"
                                />
                              </TouchableOpacity>
                              <TextInput
                                className="flex-1 text-center py-2 text-base font-bold text-base-content"
                                value={
                                  editingSet?.partialReps?.toString() || ""
                                }
                                onChangeText={(value) => {
                                  if (editingSet) {
                                    if (value === "" || value === "-") {
                                      setEditingSet({
                                        ...editingSet,
                                        partialReps: null,
                                      });
                                    } else {
                                      const parsed = parseInt(value);
                                      if (!isNaN(parsed)) {
                                        setEditingSet({
                                          ...editingSet,
                                          partialReps: parsed,
                                        });
                                      }
                                    }
                                  }
                                }}
                                placeholder="0"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                returnKeyType="done"
                                blurOnSubmit={true}
                              />
                              <TouchableOpacity
                                className="px-3 py-2"
                                onPress={() => {
                                  if (editingSet) {
                                    setEditingSet({
                                      ...editingSet,
                                      partialReps:
                                        (editingSet.partialReps || 0) + 1,
                                    });
                                  }
                                }}
                              >
                                <Ionicons
                                  name="add"
                                  size={16}
                                  color="#6b7280"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : (
                      // Display Mode
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-4">
                          <View className="bg-success w-8 h-8 rounded-full items-center justify-center">
                            <Text className="text-white text-sm font-bold">
                              {set.set_number || 0}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-4">
                            {set.is_unilateral ? (
                              <View className="items-center">
                                <Text className="text-xs text-muted">Reps</Text>
                                <View className="flex-row gap-2">
                                  <Text className="text-base font-bold text-base-content">
                                    L: {set.left_reps || 0}
                                  </Text>
                                  <Text className="text-base font-bold text-base-content">
                                    R: {set.right_reps || 0}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <View className="items-center">
                                <Text className="text-xs text-muted">Reps</Text>
                                <Text className="text-base font-bold text-base-content">
                                  {set.reps || 0}
                                </Text>
                              </View>
                            )}
                            <View className="items-center">
                              <Text className="text-xs text-muted">Weight</Text>
                              <Text className="text-base font-bold text-base-content">
                                {set.weight || 0} lbs
                              </Text>
                            </View>
                            {(set.partialReps ?? 0) > 0 && (
                              <View className="items-center">
                                <Text className="text-xs text-muted">
                                  Partials
                                </Text>
                                <Text className="text-base font-bold text-warning">
                                  +{set.partialReps || 0}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => startEditingSet(set, originalIndex)}
                            className="p-2"
                          >
                            <Ionicons
                              name="create-outline"
                              size={18}
                              color="#6b7280"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => removeSet(originalIndex)}
                            className="p-2"
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#ef4444"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExerciseTracker;
