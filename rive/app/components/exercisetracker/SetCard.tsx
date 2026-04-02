import React from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import RepsInput from "./RepsInput";
import WeightInput from "./WeightInput";
import AppText from "../ui/AppText";

type SetCardProps = {
  set: ExerciseSet;
  isEditing: boolean;
  editingSet: ExerciseSet | null;
  setEditingSet: (set: ExerciseSet | null) => void;
  weightIncrement: number;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function SetCard({
  set,
  isEditing,
  editingSet,
  setEditingSet,
  weightIncrement,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: SetCardProps) {
  const colorScheme = useColorScheme();
  const mutedIcon = colorScheme === "dark" ? "#a1a1aa" : "#6b7280";

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

    return (
      <View className="bg-surface dark:bg-surface-dark rounded-ds-card border border-border dark:border-border-dark p-4">
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="bg-warning w-8 h-8 rounded-full items-center justify-center">
                <AppText
                  variant="body"
                  tone="inverse"
                  className="text-sm font-bold"
                >
                  {editingSet.set_number || 0}
                </AppText>
              </View>
              <AppText
                variant="body"
                tone="default"
                className="text-sm font-semibold"
              >
                Editing set
              </AppText>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={onSave}
                disabled={saveDisabled}
                className={`w-8 h-8 items-center justify-center rounded-full ${
                  saveDisabled
                    ? "bg-surfaceAlt dark:bg-surfaceAlt-dark"
                    : "bg-success"
                }`}
              >
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onCancel}
                className="w-8 h-8 items-center justify-center rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark"
              >
                <Ionicons name="close" size={16} color={mutedIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="gap-3">
            {editingSet.is_unilateral ? (
              <RepsInput
                isUnilateral={true}
                leftValue={editingSet.left_reps}
                rightValue={editingSet.right_reps}
                onLeftChange={(val) =>
                  setEditingSet({ ...editingSet, left_reps: val })
                }
                onRightChange={(val) =>
                  setEditingSet({ ...editingSet, right_reps: val })
                }
                variant="edit"
              />
            ) : (
              <RepsInput
                value={editingSet.reps}
                onChange={(val) => setEditingSet({ ...editingSet, reps: val })}
                variant="edit"
              />
            )}

            <WeightInput
              value={editingSet.weight}
              onChange={(val) => setEditingSet({ ...editingSet, weight: val })}
              weightIncrement={weightIncrement}
              variant="edit"
            />

            <View>
              <AppText
                variant="caption"
                tone="muted"
                className="normal-case tracking-normal mb-1"
              >
                Partials
              </AppText>
              <View className="flex-row items-center bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-ds-control border border-border dark:border-border-dark">
                <TouchableOpacity
                  className="px-3 py-2"
                  onPress={() => {
                    const newValue = (editingSet.partialReps || 0) - 1;
                    if (newValue >= 0) {
                      setEditingSet({
                        ...editingSet,
                        partialReps: newValue,
                      });
                    }
                  }}
                >
                  <Ionicons name="remove" size={16} color={mutedIcon} />
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center py-2 text-base font-bold text-text dark:text-text-dark"
                  value={editingSet?.partialReps?.toString() || ""}
                  onChangeText={(value) => {
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
                  }}
                  placeholder="0"
                  placeholderTextColor={mutedIcon}
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  className="px-3 py-2"
                  onPress={() => {
                    setEditingSet({
                      ...editingSet,
                      partialReps: (editingSet.partialReps || 0) + 1,
                    });
                  }}
                >
                  <Ionicons name="add" size={16} color={mutedIcon} />
                </TouchableOpacity>
              </View>
            </View>
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
            <AppText
              variant="body"
              tone="default"
              className="text-sm font-bold"
            >
              {set.set_number || 0}
            </AppText>
          </View>
          <View className="flex-row items-center gap-4 flex-wrap">
            {set.is_unilateral ? (
              <View className="items-center">
                <AppText
                  variant="caption"
                  tone="muted"
                  className="normal-case tracking-normal"
                >
                  Reps
                </AppText>
                <View className="flex-row gap-2">
                  <AppText
                    variant="body"
                    tone="default"
                    className="text-base font-bold"
                  >
                    L: {set.left_reps || 0}
                  </AppText>
                  <AppText
                    variant="body"
                    tone="default"
                    className="text-base font-bold"
                  >
                    R: {set.right_reps || 0}
                  </AppText>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <AppText
                  variant="caption"
                  tone="muted"
                  className="normal-case tracking-normal"
                >
                  Reps
                </AppText>
                <AppText
                  variant="body"
                  tone="default"
                  className="text-base font-bold"
                >
                  {set.reps || 0}
                </AppText>
              </View>
            )}
            <View className="items-center">
              <AppText
                variant="caption"
                tone="muted"
                className="normal-case tracking-normal"
              >
                Weight
              </AppText>
              <AppText
                variant="body"
                tone="default"
                className="text-base font-bold"
              >
                {set.weight || 0} lbs
              </AppText>
            </View>
            {(set.partialReps ?? 0) > 0 && (
              <View className="items-center">
                <AppText
                  variant="caption"
                  tone="muted"
                  className="normal-case tracking-normal"
                >
                  Partials
                </AppText>
                <AppText
                  variant="body"
                  className="text-base font-bold text-warning"
                >
                  +{set.partialReps || 0}
                </AppText>
              </View>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-1 shrink-0">
          <TouchableOpacity
            onPress={onEdit}
            className="p-2"
            accessibilityLabel="Edit set"
          >
            <Ionicons name="create-outline" size={18} color={mutedIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="p-2"
            accessibilityLabel="Delete set"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
