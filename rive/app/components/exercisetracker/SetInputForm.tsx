import React from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import AppText from "../ui/AppText";
import type { PadField } from "./exercisePadUtils";
import { formatRepsDisplay, formatWeightDisplay } from "./exercisePadUtils";

export type SetInputFormProps = {
  currentSet: ExerciseSet;
  setCurrentSet: React.Dispatch<React.SetStateAction<ExerciseSet>>;
  lastSessionLabel: string | null;
  showPartials: boolean;
  setShowPartials: (v: boolean) => void;
  onAddSet: () => void;
  hasSets: boolean;
  padActive: boolean;
  padOpen: boolean;
  activePadField: PadField;
  padBuffer: string;
  onFocusPadField: (field: PadField) => void;
};

const quickReps = [5, 8, 10, 12, 15];

export default function SetInputForm({
  currentSet,
  setCurrentSet,
  lastSessionLabel,
  showPartials,
  setShowPartials,
  onAddSet,
  hasSets,
  padActive,
  padOpen,
  activePadField,
  padBuffer,
  onFocusPadField,
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

  const padEditing = padActive && padOpen;

  const weightDisplay =
    padEditing && activePadField === "weight"
      ? padBuffer === ""
        ? "—"
        : padBuffer
      : formatWeightDisplay(currentSet.weight);

  const repsDisplay =
    padEditing && activePadField === "reps"
      ? padBuffer === ""
        ? "—"
        : padBuffer
      : formatRepsDisplay(currentSet.reps);

  const leftRepsDisplay =
    padEditing && activePadField === "leftReps"
      ? padBuffer === ""
        ? "—"
        : padBuffer
      : formatRepsDisplay(currentSet.left_reps ?? null);

  const rightRepsDisplay =
    padEditing && activePadField === "rightReps"
      ? padBuffer === ""
        ? "—"
        : padBuffer
      : formatRepsDisplay(currentSet.right_reps ?? null);

  const sharedWeightDisplay =
    padEditing && activePadField === "weight"
      ? padBuffer === ""
        ? "—"
        : padBuffer
      : formatWeightDisplay(currentSet.weight);

  const leftRepsFocused = padEditing && activePadField === "leftReps";
  const rightRepsFocused = padEditing && activePadField === "rightReps";
  const weightCellFocused = padEditing && activePadField === "weight";
  const repsCellFocused = padEditing && activePadField === "reps";

  return (
    <View className="bg-surface dark:bg-surface-dark rounded-[1.5rem] border border-border dark:border-border-dark p-5 mb-4">
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1 min-w-0 pr-2">
          <AppText
            variant="subheader"
            tone="default"
            className="font-bold text-xl uppercase"
          >
            Set {currentSet.set_number}
          </AppText>
          {lastSessionLabel ? (
            <View className="mt-2 self-start bg-surfaceAlt dark:bg-surfaceAlt-dark px-2 py-1 rounded-full border border-border dark:border-border-dark">
              <AppText variant="caption" tone="muted" className="font-bold">
                {lastSessionLabel}
              </AppText>
            </View>
          ) : null}
        </View>
        {isSetComplete ? (
          <Ionicons name="checkmark-circle" size={22} color={primary} />
        ) : null}
      </View>

      {currentSet.is_unilateral ? (
        <View className="gap-5">
          <View>
            <AppText
              variant="caption"
              tone="muted"
              className="text-center mb-2 font-black"
            >
              Weight (lbs)
            </AppText>
            <TouchableOpacity
              onPress={() => onFocusPadField("weight")}
              disabled={!padActive}
              className={`min-h-[80px] rounded-xl items-center justify-center border-2 ${
                padEditing && activePadField === "weight"
                  ? "bg-surfaceAlt dark:bg-surfaceAlt-dark border-primary dark:border-primary-dark"
                  : "bg-surfaceAlt dark:bg-surfaceAlt-dark border-border dark:border-border-dark"
              } ${!padActive ? "opacity-40" : ""}`}
            >
              <AppText
                variant="subheader"
                tone="default"
                className="font-black"
              >
                {sharedWeightDisplay}
              </AppText>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 min-w-0 gap-3">
              <View className="flex-row items-center gap-2">
                <View className="h-px flex-1 bg-border dark:bg-border-dark" />
                <AppText variant="caption" tone="muted" className="font-black">
                  Left
                </AppText>
                <View className="h-px flex-1 bg-border dark:bg-border-dark" />
              </View>
              <View className="w-full">
                <AppText
                  variant="caption"
                  tone="muted"
                  className="text-center font-bold mb-2"
                >
                  Reps
                </AppText>
                <TouchableOpacity
                  onPress={() => onFocusPadField("leftReps")}
                  disabled={!padActive}
                  activeOpacity={0.85}
                  className={`min-h-[80px] rounded-xl items-center justify-center border-2 ${
                    leftRepsFocused
                      ? "bg-surface dark:bg-surface-dark border-primary dark:border-primary-dark"
                      : "bg-surfaceAlt dark:bg-surfaceAlt-dark border-border dark:border-border-dark"
                  } ${!padActive ? "opacity-40" : ""}`}
                >
                  <AppText
                    variant="subheader"
                    tone={leftRepsFocused ? "default" : "muted"}
                    className="font-black"
                    numberOfLines={1}
                  >
                    {leftRepsDisplay}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-1 min-w-0 gap-3">
              <View className="flex-row items-center gap-2">
                <View className="h-px flex-1 bg-border dark:bg-border-dark" />
                <AppText variant="caption" tone="muted" className="font-black">
                  Right
                </AppText>
                <View className="h-px flex-1 bg-border dark:bg-border-dark" />
              </View>
              <View className="w-full">
                <AppText
                  variant="caption"
                  tone="muted"
                  className="text-center font-bold mb-2"
                >
                  Reps
                </AppText>
                <TouchableOpacity
                  onPress={() => onFocusPadField("rightReps")}
                  disabled={!padActive}
                  activeOpacity={0.85}
                  className={`min-h-[80px] rounded-xl items-center justify-center border-2 ${
                    rightRepsFocused
                      ? "bg-surface dark:bg-surface-dark border-primary dark:border-primary-dark"
                      : "bg-surfaceAlt dark:bg-surfaceAlt-dark border-border dark:border-border-dark"
                  } ${!padActive ? "opacity-40" : ""}`}
                >
                  <AppText
                    variant="subheader"
                    tone={rightRepsFocused ? "default" : "muted"}
                    className="font-black text-3xl"
                    numberOfLines={1}
                  >
                    {rightRepsDisplay}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row gap-4 mb-2">
          <View className="flex-1 min-w-0">
            <AppText
              variant="caption"
              tone="muted"
              className="text-center normal-case tracking-wider text-[10px] font-bold mb-2"
            >
              Weight (lbs)
            </AppText>
            <TouchableOpacity
              onPress={() => onFocusPadField("weight")}
              disabled={!padActive}
              activeOpacity={0.85}
              className={`min-h-[80px] rounded-xl items-center justify-center border-2 ${
                weightCellFocused
                  ? "bg-surface dark:bg-surface-dark border-primary dark:border-primary-dark"
                  : "bg-surfaceAlt dark:bg-surfaceAlt-dark border-border dark:border-border-dark"
              } ${!padActive ? "opacity-40" : ""}`}
            >
              <AppText
                variant="subheader"
                tone={weightCellFocused ? "default" : "muted"}
                className="font-black text-3xl"
                numberOfLines={1}
              >
                {weightDisplay}
              </AppText>
            </TouchableOpacity>
          </View>
          <View className="flex-1 min-w-0">
            <AppText
              variant="caption"
              tone="muted"
              className="text-center normal-case tracking-wider text-[10px] font-bold mb-2"
            >
              Reps
            </AppText>
            <TouchableOpacity
              onPress={() => onFocusPadField("reps")}
              disabled={!padActive}
              activeOpacity={0.85}
              className={`min-h-[80px] rounded-xl items-center justify-center border-2 ${
                repsCellFocused
                  ? "bg-surface dark:bg-surface-dark border-primary dark:border-primary-dark"
                  : "bg-surfaceAlt dark:bg-surfaceAlt-dark border-border dark:border-border-dark"
              } ${!padActive ? "opacity-40" : ""}`}
            >
              <AppText
                variant="subheader"
                tone={repsCellFocused ? "default" : "muted"}
                className="font-black text-3xl"
                numberOfLines={1}
              >
                {repsDisplay}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap gap-2 mt-4 mb-2">
        {quickReps.map((reps) => (
          <TouchableOpacity
            key={reps}
            onPress={() => handleQuickRep(reps)}
            disabled={!padActive}
            className={`px-4 py-2 rounded-full ${
              isQuickRepSelected(reps)
                ? "bg-primary dark:bg-primary-dark"
                : "bg-surfaceAlt dark:bg-surfaceAlt-dark"
            } ${!padActive ? "opacity-40" : ""}`}
          >
            <AppText
              variant="body"
              tone={isQuickRepSelected(reps) ? "inverse" : "default"}
              className="text-xs font-semibold"
            >
              {reps}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {showPartials && padActive ? (
        <View className="mt-2 mb-2">
          <AppText variant="caption" tone="muted" className="normal-case mb-1">
            Partials
          </AppText>
          <View className="flex-row items-center rounded-ds-control border border-border dark:border-border-dark bg-surfaceAlt dark:bg-surfaceAlt-dark">
            <TouchableOpacity
              className="px-3 py-2"
              onPress={() => {
                const newValue = (currentSet.partialReps || 0) - 1;
                if (newValue >= 0) {
                  setCurrentSet({ ...currentSet, partialReps: newValue });
                }
              }}
            >
              <Ionicons name="remove" size={18} color={mutedIcon} />
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
                  const parsed = parseInt(value, 10);
                  if (!Number.isNaN(parsed)) {
                    setCurrentSet({ ...currentSet, partialReps: parsed });
                  }
                }
              }}
              placeholder="0"
              placeholderTextColor={mutedIcon}
              keyboardType="number-pad"
              returnKeyType="done"
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
              <Ionicons name="add" size={18} color={mutedIcon} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          setCurrentSet({
            ...currentSet,
            is_unilateral: !currentSet.is_unilateral,
          })
        }
        className="flex-row items-center justify-between mt-4 pt-4 border-t border-border dark:border-border-dark"
      >
        <View className="flex-row items-center gap-2 flex-1 min-w-0 pr-2">
          <Ionicons name="body-outline" size={20} color={mutedIcon} />
          <AppText
            variant="body"
            tone="default"
            className="text-xs font-bold uppercase tracking-wider shrink"
          >
            Unilateral set
          </AppText>
        </View>
        <Ionicons
          name={currentSet.is_unilateral ? "checkbox" : "square-outline"}
          size={24}
          color={currentSet.is_unilateral ? primary : mutedIcon}
        />
      </TouchableOpacity>

      <View className="mt-5">
        <TouchableOpacity
          onPress={onAddSet}
          disabled={!isSetComplete || !padActive}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 border border-border dark:border-border-dark bg-surfaceAlt dark:bg-surfaceAlt-dark ${
            isSetComplete && padActive ? "active:opacity-90" : "opacity-45"
          }`}
        >
          <Ionicons name="add" size={22} color={primary} />
          <AppText
            variant="body"
            tone="primary"
            className="font-bold uppercase tracking-wider text-xs"
          >
            Add set
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
