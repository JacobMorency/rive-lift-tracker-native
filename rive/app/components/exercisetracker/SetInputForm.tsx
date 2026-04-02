import React from "react";
import { View, Text, TouchableOpacity, TextInput, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import RepsInput from "./RepsInput";
import WeightInput from "./WeightInput";
import WeightIncrementTabs from "./WeightIncrementTabs";
import AppButton from "../ui/AppButton";
import AppText from "../ui/AppText";

type SetInputFormProps = {
  currentSet: ExerciseSet;
  setCurrentSet: (set: ExerciseSet) => void;
  weightInput: string;
  setWeightInput: (value: string) => void;
  weightIncrement: number;
  setWeightIncrement: (value: number) => void;
  showPartials: boolean;
  setShowPartials: (value: boolean) => void;
  onAddSet: () => void;
  onCopyLastSet: () => void;
  hasSets: boolean;
};

export default function SetInputForm({
  currentSet,
  setCurrentSet,
  weightInput,
  setWeightInput,
  weightIncrement,
  setWeightIncrement,
  showPartials,
  setShowPartials,
  onAddSet,
  onCopyLastSet,
  hasSets,
}: SetInputFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primary = isDark ? "#ff6fa1" : "#ff4b8c";
  const mutedIcon = isDark ? "#a1a1aa" : "#6b7280";

  const isSetComplete = currentSet.is_unilateral
    ? currentSet.left_reps !== null &&
      currentSet.right_reps !== null &&
      currentSet.weight !== null &&
      currentSet.weight >= 0
    : currentSet.reps !== null &&
      currentSet.reps !== 0 &&
      currentSet.weight !== null &&
      currentSet.weight >= 0;

  const quickReps = [5, 8, 10, 12, 15];

  const handleQuickRep = (reps: number) => {
    if (currentSet.is_unilateral) {
      setCurrentSet({
        ...currentSet,
        left_reps: reps,
        right_reps: reps,
      });
    } else {
      setCurrentSet({ ...currentSet, reps });
    }
  };

  const isQuickRepSelected = (reps: number) => {
    if (currentSet.is_unilateral) {
      return currentSet.left_reps === reps && currentSet.right_reps === reps;
    }
    return currentSet.reps === reps;
  };

  return (
    <View className="bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-ds-card border border-border dark:border-border-dark p-4 mb-4">
      <View className="mb-3 flex-row items-center justify-between gap-2">
        <AppText variant="caption" tone="primary" className="font-bold tracking-widest">
          Set {currentSet.set_number}
        </AppText>
        <TouchableOpacity
          onPress={() => setShowPartials(!showPartials)}
          className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 border ${
            showPartials
              ? "bg-primary/15 dark:bg-primary-dark/15 border-primary dark:border-primary-dark"
              : "bg-surface dark:bg-surface-dark border-border dark:border-border-dark"
          }`}
        >
          <Ionicons
            name={showPartials ? "eye-off-outline" : "eye-outline"}
            size={14}
            color={showPartials ? primary : mutedIcon}
          />
          <AppText
            variant="caption"
            tone={showPartials ? "primary" : "default"}
            className="normal-case tracking-normal"
          >
            {showPartials ? "Hide partials" : "Show partials"}
          </AppText>
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        <View className="mb-1">
          <AppText variant="caption" tone="muted" className="normal-case tracking-normal mb-2">
            Quick reps
          </AppText>
          <View className="flex-row flex-wrap gap-2">
            {quickReps.map((reps) => (
              <TouchableOpacity
                key={reps}
                onPress={() => handleQuickRep(reps)}
                className={`px-4 py-2 rounded-full border ${
                  isQuickRepSelected(reps)
                    ? "border-primary dark:border-primary-dark bg-primary/10 dark:bg-primary-dark/10"
                    : "border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
                }`}
              >
                <AppText
                  variant="body"
                  tone={isQuickRepSelected(reps) ? "primary" : "default"}
                  className="text-sm font-bold"
                >
                  {reps}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {currentSet.is_unilateral ? (
          <View className="gap-3">
            <RepsInput
              isUnilateral={true}
              leftValue={currentSet.left_reps}
              rightValue={currentSet.right_reps}
              onLeftChange={(val) =>
                setCurrentSet({ ...currentSet, left_reps: val })
              }
              onRightChange={(val) =>
                setCurrentSet({ ...currentSet, right_reps: val })
              }
              variant="form"
            />
            <WeightInput
              value={currentSet.weight}
              textInputValue={weightInput}
              onChange={(val) => setCurrentSet({ ...currentSet, weight: val })}
              onTextChange={setWeightInput}
              weightIncrement={weightIncrement}
              variant="form"
            />
          </View>
        ) : (
          <View className="flex-row gap-3">
            <RepsInput
              value={currentSet.reps}
              onChange={(val) => setCurrentSet({ ...currentSet, reps: val })}
              variant="form"
            />
            <WeightInput
              value={currentSet.weight}
              textInputValue={weightInput}
              onChange={(val) => setCurrentSet({ ...currentSet, weight: val })}
              onTextChange={setWeightInput}
              weightIncrement={weightIncrement}
              variant="form"
            />
          </View>
        )}

        {showPartials && (
          <View className="flex-1">
            <AppText variant="caption" tone="muted" className="normal-case tracking-normal mb-1">
              Partials
            </AppText>
            <View
              className={`rounded-ds-control flex-row items-center border-2 ${
                currentSet.partialReps !== null && currentSet.partialReps > 0
                  ? "bg-primary/10 dark:bg-primary-dark/10 border-primary dark:border-primary-dark"
                  : "bg-surface dark:bg-surface-dark border-transparent"
              }`}
            >
              <TouchableOpacity
                className="px-3 py-2"
                onPress={() => {
                  const newValue = (currentSet.partialReps || 0) - 1;
                  if (newValue >= 0) {
                    setCurrentSet({ ...currentSet, partialReps: newValue });
                  }
                }}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={
                    currentSet.partialReps !== null &&
                    currentSet.partialReps > 0
                      ? primary
                      : mutedIcon
                  }
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 text-center py-2 text-lg font-bold text-text dark:text-text-dark"
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
                placeholderTextColor={mutedIcon}
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <TouchableOpacity
                className="px-3 py-2"
                onPress={() =>
                  setCurrentSet({
                    ...currentSet,
                    partialReps: (currentSet.partialReps || 0) + 1,
                  })
                }
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={
                    currentSet.partialReps !== null &&
                    currentSet.partialReps > 0
                      ? primary
                      : mutedIcon
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <WeightIncrementTabs
        value={weightIncrement}
        onChange={setWeightIncrement}
      />

      <View className="mt-6">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className={`w-6 h-6 rounded border-2 items-center justify-center ${
              currentSet.is_unilateral
                ? "bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark"
                : "border-border dark:border-border-dark"
            }`}
            onPress={() =>
              setCurrentSet({
                ...currentSet,
                is_unilateral: !currentSet.is_unilateral,
              })
            }
          >
            {currentSet.is_unilateral && (
              <Ionicons name="checkmark" size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
          <AppText variant="body" tone="default" className="text-sm">
            Unilateral (L/R)
          </AppText>
        </View>
      </View>

      <View className="gap-3 mt-6">
        <AppButton
          tone="primary"
          size="lg"
          fullWidth
          disabled={!isSetComplete}
          onPress={onAddSet}
          label="Add set"
          icon={
            <Ionicons
              name="add-circle"
              size={20}
              color={isSetComplete ? "#ffffff" : mutedIcon}
            />
          }
          accessibilityLabel="Add set"
        />
        {hasSets ? (
          <TouchableOpacity
            onPress={onCopyLastSet}
            accessibilityRole="button"
            accessibilityLabel="Copy last set"
            className="w-full flex-row items-center justify-center px-5 py-4 rounded-ds-control border-2 border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary-dark/10 active:opacity-90"
          >
            <Ionicons name="copy-outline" size={20} color={primary} />
            <AppText variant="body" tone="primary" className="font-semibold ml-2">
              Copy last
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
