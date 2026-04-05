import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import AppText from "../ui/AppText";
import type { PadField } from "./exercisePadUtils";
import { formatRepsDisplay, formatWeightDisplay } from "./exercisePadUtils";

export type SetInputFormProps = {
  currentSet: ExerciseSet;
  setCurrentSet: React.Dispatch<React.SetStateAction<ExerciseSet>>;
  lastSessionLabel: string | null;
  /** Default: log new/current set. `edit` uses main card for completed-set editing. */
  variant?: "log" | "edit";
  onAddSet?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  padActive: boolean;
  padOpen: boolean;
  activePadField: PadField;
  padBuffer: string;
  onFocusPadField: (field: PadField) => void;
};

export default function SetInputForm({
  currentSet,
  setCurrentSet,
  lastSessionLabel,
  variant = "log",
  onAddSet,
  onSaveEdit,
  onCancelEdit,
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

  const isEditVariant = variant === "edit";

  const hasPartialIncomplete =
    !isEditVariant &&
    !isSetComplete &&
    (currentSet.is_unilateral
      ? currentSet.weight != null ||
        currentSet.left_reps != null ||
        currentSet.right_reps != null
      : currentSet.weight != null || currentSet.reps != null);

  const incompleteWarningText = currentSet.is_unilateral
    ? "Add weight and left/right reps to finish this set."
    : "Add weight and reps to finish this set.";

  return (
    <View
      className={`bg-surface dark:bg-surface-dark rounded-[1.5rem] border p-5 mb-4 ${
        isEditVariant
          ? "border-primary/25 dark:border-primary-dark/25 ring-2 ring-primary/15 dark:ring-primary-dark/15"
          : "border-border dark:border-border-dark"
      }`}
    >
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1 min-w-0 pr-2">
          <AppText
            variant="subheader"
            tone="default"
            className="font-bold text-xl uppercase"
          >
            Set {currentSet.set_number}
          </AppText>
          {isEditVariant ? (
            <View className="mt-2 self-start bg-surfaceAlt dark:bg-surfaceAlt-dark px-2 py-0.5 rounded-full border border-border dark:border-border-dark">
              <AppText
                variant="caption"
                tone="muted"
                className="text-[10px] font-black uppercase"
              >
                Editing
              </AppText>
            </View>
          ) : lastSessionLabel ? (
            <View className="mt-2 self-start bg-surfaceAlt dark:bg-surfaceAlt-dark px-2 py-1 rounded-full border border-border dark:border-border-dark">
              <AppText variant="caption" tone="muted" className="font-bold">
                {lastSessionLabel}
              </AppText>
            </View>
          ) : null}
        </View>
        {isEditVariant ? (
          <View className="flex-row items-center gap-2 shrink-0">
            <TouchableOpacity
              onPress={onSaveEdit}
              disabled={!isSetComplete}
              className={`w-9 h-9 items-center justify-center rounded-full ${
                isSetComplete
                  ? "bg-primary dark:bg-primary-dark"
                  : "bg-surfaceAlt dark:bg-surfaceAlt-dark"
              }`}
              accessibilityLabel="Save set"
            >
              <Ionicons name="checkmark" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancelEdit}
              className="w-9 h-9 items-center justify-center rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark"
              accessibilityLabel="Cancel editing"
            >
              <Ionicons name="close" size={18} color={mutedIcon} />
            </TouchableOpacity>
          </View>
        ) : isSetComplete ? (
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

      {hasPartialIncomplete ? (
        <View className="flex-row items-start gap-2 mt-4">
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={mutedIcon}
            style={{ marginTop: 1 }}
          />
          <AppText
            variant="caption"
            tone="muted"
            className="flex-1 normal-case leading-snug text-[12px]"
          >
            {incompleteWarningText}
          </AppText>
        </View>
      ) : null}

      <View className="mt-4 pt-4 border-t border-border dark:border-border-dark gap-1">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setCurrentSet({
              ...currentSet,
              is_unilateral: !currentSet.is_unilateral,
            })
          }
          className="flex-row items-center justify-between py-2"
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
      </View>

      {!isEditVariant && onAddSet ? (
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
      ) : null}
    </View>
  );
}
