import React, { type RefObject } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import AppText from "../ui/AppText";
import type { PadField } from "./exercisePadUtils";
import {
  formatRepsDisplay,
  formatWeightDisplay,
} from "./exercisePadUtils";

type SetCardProps = {
  set: ExerciseSet;
  isEditing: boolean;
  editingSet: ExerciseSet | null;
  setEditingSet: (set: ExerciseSet | null) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isPadTarget: boolean;
  padOpen: boolean;
  padField: PadField;
  padBuffer: string;
  onFocusPadField: (field: PadField) => void;
  /** When editing, attached to the edit card root for scroll-into-view above the numeric pad. */
  editSectionRef?: RefObject<View | null>;
};

function EditCell({
  label,
  focused,
  display,
  onPress,
}: {
  label: string;
  focused: boolean;
  display: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-1 min-w-0">
      <AppText
        variant="caption"
        tone="muted"
        className="text-center normal-case tracking-wider text-[10px] font-bold mb-2"
      >
        {label}
      </AppText>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className={`min-h-[72px] rounded-xl items-center justify-center border-2 ${
          focused
            ? "bg-surface dark:bg-surface-dark border-primary dark:border-primary-dark"
            : "bg-surfaceAlt dark:bg-surfaceAlt-dark border-border dark:border-border-dark"
        }`}
      >
        <AppText
          variant="subheader"
          tone={focused ? "default" : "muted"}
          className="font-black text-2xl"
          numberOfLines={1}
        >
          {display}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

export default function SetCard({
  set,
  isEditing,
  editingSet,
  setEditingSet,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  isPadTarget,
  padOpen,
  padField,
  padBuffer,
  onFocusPadField,
  editSectionRef,
}: SetCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const mutedIcon = isDark ? "#a1a1aa" : "#6b7280";
  const primary = isDark ? "#ff6fa1" : "#ff4b8c";

  if (isEditing && editingSet) {
    const saveDisabled = editingSet.is_unilateral
      ? editingSet.left_reps === null ||
        editingSet.right_reps === null ||
        editingSet.weight === null ||
        editingSet.weight < 0
      : editingSet.reps === null ||
        editingSet.reps === 0 ||
        editingSet.weight === null ||
        editingSet.weight < 0;

    const padLive = isPadTarget && padOpen;

    const weightDisplay =
      padLive && padField === "weight"
        ? padBuffer === ""
          ? "—"
          : padBuffer
        : formatWeightDisplay(editingSet.weight);

    const repsDisplay =
      padLive && padField === "reps"
        ? padBuffer === ""
          ? "—"
          : padBuffer
        : formatRepsDisplay(editingSet.reps);

    const leftRepsDisplay =
      padLive && padField === "leftReps"
        ? padBuffer === ""
          ? "—"
          : padBuffer
        : formatRepsDisplay(editingSet.left_reps ?? null);

    const rightRepsDisplay =
      padLive && padField === "rightReps"
        ? padBuffer === ""
          ? "—"
          : padBuffer
        : formatRepsDisplay(editingSet.right_reps ?? null);

    const sharedWeightDisplay =
      padLive && padField === "weight"
        ? padBuffer === ""
          ? "—"
          : padBuffer
        : formatWeightDisplay(editingSet.weight);

    return (
      <View
        ref={editSectionRef}
        collapsable={false}
        className="bg-surface dark:bg-surface-dark rounded-ds-card border-2 border-warning/40 p-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="bg-warning w-8 h-8 rounded-full items-center justify-center">
              <AppText variant="body" tone="inverse" className="text-sm font-bold">
                {editingSet.set_number || 0}
              </AppText>
            </View>
            <AppText variant="body" tone="default" className="text-sm font-semibold">
              Editing set
            </AppText>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={onSave}
              disabled={saveDisabled}
              className={`w-9 h-9 items-center justify-center rounded-full ${
                saveDisabled ? "bg-surfaceAlt dark:bg-surfaceAlt-dark" : "bg-primary dark:bg-primary-dark"
              }`}
            >
              <Ionicons name="checkmark" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancel}
              className="w-9 h-9 items-center justify-center rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark"
            >
              <Ionicons name="close" size={18} color={mutedIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {editingSet.is_unilateral ? (
          <View className="gap-4">
            <View>
              <AppText
                variant="caption"
                tone="muted"
                className="text-center normal-case text-[10px] font-bold mb-2"
              >
                Weight (lbs)
              </AppText>
              <TouchableOpacity
                onPress={() => onFocusPadField("weight")}
                className={`min-h-[72px] rounded-xl items-center justify-center border-2 ${
                  padLive && padField === "weight"
                    ? "border-primary dark:border-primary-dark bg-surfaceAlt dark:bg-surfaceAlt-dark"
                    : "border-border dark:border-border-dark bg-surfaceAlt dark:bg-surfaceAlt-dark"
                }`}
              >
                <AppText variant="subheader" tone="default" className="font-black text-2xl">
                  {sharedWeightDisplay}
                </AppText>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-3">
              <EditCell
                label="Left reps"
                focused={padLive && padField === "leftReps"}
                display={leftRepsDisplay}
                onPress={() => onFocusPadField("leftReps")}
              />
              <EditCell
                label="Right reps"
                focused={padLive && padField === "rightReps"}
                display={rightRepsDisplay}
                onPress={() => onFocusPadField("rightReps")}
              />
            </View>
          </View>
        ) : (
          <View className="flex-row gap-3">
            <EditCell
              label="Weight (lbs)"
              focused={padLive && padField === "weight"}
              display={weightDisplay}
              onPress={() => onFocusPadField("weight")}
            />
            <EditCell
              label="Reps"
              focused={padLive && padField === "reps"}
              display={repsDisplay}
              onPress={() => onFocusPadField("reps")}
            />
          </View>
        )}

        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-border dark:border-border-dark">
          <AppText variant="caption" tone="default" className="normal-case font-semibold">
            Unilateral
          </AppText>
          <Switch
            value={!!editingSet.is_unilateral}
            onValueChange={(v) =>
              setEditingSet({
                ...editingSet,
                is_unilateral: v,
              })
            }
            trackColor={{ false: mutedIcon, true: primary }}
            thumbColor="#ffffff"
          />
        </View>

        <View className="mt-3">
          <AppText variant="caption" tone="muted" className="normal-case mb-1">
            Partials
          </AppText>
          <View className="flex-row items-center rounded-ds-control border border-border dark:border-border-dark bg-surfaceAlt dark:bg-surfaceAlt-dark">
            <TouchableOpacity
              className="px-3 py-2"
              onPress={() => {
                const newValue = (editingSet.partialReps || 0) - 1;
                if (newValue >= 0) {
                  setEditingSet({ ...editingSet, partialReps: newValue });
                }
              }}
            >
              <Ionicons name="remove" size={16} color={mutedIcon} />
            </TouchableOpacity>
            <TextInput
              className="flex-1 text-center py-2 text-base font-bold text-text dark:text-text-dark"
              value={editingSet.partialReps?.toString() || ""}
              onChangeText={(value) => {
                if (value === "" || value === "-") {
                  setEditingSet({ ...editingSet, partialReps: null });
                } else {
                  const parsed = parseInt(value, 10);
                  if (!Number.isNaN(parsed)) {
                    setEditingSet({ ...editingSet, partialReps: parsed });
                  }
                }
              }}
              placeholder="0"
              placeholderTextColor={mutedIcon}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              className="px-3 py-2"
              onPress={() =>
                setEditingSet({
                  ...editingSet,
                  partialReps: (editingSet.partialReps || 0) + 1,
                })
              }
            >
              <Ionicons name="add" size={16} color={mutedIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-surface dark:bg-surface-dark rounded-ds-card border border-border dark:border-border-dark p-4">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-4 flex-1 min-w-0">
          <View className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark w-8 h-8 rounded-full items-center justify-center">
            <AppText variant="body" tone="default" className="text-sm font-bold">
              {set.set_number || 0}
            </AppText>
          </View>
          <View className="flex-row items-center gap-4 flex-wrap">
            {set.is_unilateral ? (
              <View className="items-center">
                <AppText variant="caption" tone="muted" className="normal-case tracking-normal">
                  Reps
                </AppText>
                <View className="flex-row gap-2">
                  <AppText variant="body" tone="default" className="text-base font-bold">
                    L: {set.left_reps || 0}
                  </AppText>
                  <AppText variant="body" tone="default" className="text-base font-bold">
                    R: {set.right_reps || 0}
                  </AppText>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <AppText variant="caption" tone="muted" className="normal-case tracking-normal">
                  Reps
                </AppText>
                <AppText variant="body" tone="default" className="text-base font-bold">
                  {set.reps || 0}
                </AppText>
              </View>
            )}
            <View className="items-center">
              <AppText variant="caption" tone="muted" className="normal-case tracking-normal">
                Weight
              </AppText>
              <AppText variant="body" tone="default" className="text-base font-bold">
                {set.weight || 0} lbs
              </AppText>
            </View>
            {(set.partialReps ?? 0) > 0 && (
              <View className="items-center">
                <AppText variant="caption" tone="muted" className="normal-case tracking-normal">
                  Partials
                </AppText>
                <AppText variant="body" className="text-base font-bold text-warning">
                  +{set.partialReps || 0}
                </AppText>
              </View>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-1 shrink-0">
          <TouchableOpacity onPress={onEdit} className="p-2" accessibilityLabel="Edit set">
            <Ionicons name="create-outline" size={18} color={mutedIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} className="p-2" accessibilityLabel="Delete set">
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
