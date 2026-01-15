import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import RepsInput from "./RepsInput";
import WeightInput from "./WeightInput";

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
  if (isEditing && editingSet) {
    return (
      <View
        className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-4"
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
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="bg-warning w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-white text-sm font-bold">
                  {editingSet.set_number || 0}
                </Text>
              </View>
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white">
                Editing Set
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={onSave}
                disabled={
                  editingSet.is_unilateral
                    ? editingSet.left_reps === null ||
                      editingSet.right_reps === null ||
                      editingSet.weight === null ||
                      editingSet.weight < 0
                    : editingSet.reps === null ||
                        editingSet.reps === 0 ||
                        editingSet.weight === null ||
                        editingSet.weight < 0
                }
                className={`w-8 h-8 items-center justify-center rounded-full ${
                  editingSet.is_unilateral
                    ? editingSet.left_reps === null ||
                        editingSet.right_reps === null ||
                        editingSet.weight === null ||
                        editingSet.weight < 0
                      ? "bg-gray-100 dark:bg-zinc-700"
                      : "bg-success"
                    : editingSet.reps === null ||
                        editingSet.reps === 0 ||
                        editingSet.weight === null ||
                        editingSet.weight < 0
                      ? "bg-gray-100 dark:bg-zinc-700"
                      : "bg-success"
                }`}
              >
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onCancel}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700"
              >
                <Ionicons name="close" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="gap-3">
            {/* Edit Reps */}
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

            {/* Edit Weight */}
            <WeightInput
              value={editingSet.weight}
              onChange={(val) =>
                setEditingSet({ ...editingSet, weight: val })
              }
              weightIncrement={weightIncrement}
              variant="edit"
            />

            {/* Edit Partials */}
            <View>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Partials</Text>
              <View className="flex-row items-center bg-gray-50 dark:bg-zinc-800 rounded-lg">
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
                  <Ionicons name="remove" size={16} color="#6b7280" />
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center py-2 text-base font-bold text-zinc-900 dark:text-white"
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
                  placeholderTextColor="#9ca3af"
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
                  <Ionicons name="add" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Display Mode
  return (
    <View
      className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-4"
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
                <Text className="text-xs text-gray-500 dark:text-gray-400">Reps</Text>
                <View className="flex-row gap-2">
                  <Text className="text-base font-bold text-zinc-900 dark:text-white">
                    L: {set.left_reps || 0}
                  </Text>
                  <Text className="text-base font-bold text-zinc-900 dark:text-white">
                    R: {set.right_reps || 0}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Reps</Text>
                <Text className="text-base font-bold text-zinc-900 dark:text-white">
                  {set.reps || 0}
                </Text>
              </View>
            )}
            <View className="items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-400">Weight</Text>
              <Text className="text-base font-bold text-zinc-900 dark:text-white">
                {set.weight || 0} lbs
              </Text>
            </View>
            {(set.partialReps ?? 0) > 0 && (
              <View className="items-center">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Partials</Text>
                <Text className="text-base font-bold text-warning">
                  +{set.partialReps || 0}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={onEdit} className="p-2">
            <Ionicons name="create-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} className="p-2">
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

