import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import SetCard from "./SetCard";

type CompletedSetsListProps = {
  sets: ExerciseSet[];
  showAllSets: boolean;
  setShowAllSets: (value: boolean) => void;
  editingSetIndex: number | null;
  editingSet: ExerciseSet | null;
  setEditingSet: (set: ExerciseSet | null) => void;
  weightIncrement: number;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (set: ExerciseSet, index: number) => void;
  onRemoveSet: (index: number) => void;
};

export default function CompletedSetsList({
  sets,
  showAllSets,
  setShowAllSets,
  editingSetIndex,
  editingSet,
  setEditingSet,
  weightIncrement,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onRemoveSet,
}: CompletedSetsListProps) {
  // Get sets to display (last 3 or all if showAllSets is true, in reverse order)
  const getDisplaySets = () => {
    if (!sets || sets.length === 0) return [];
    const allSets = [...sets].reverse().filter((set) => set != null);
    if (sets.length <= 3 || showAllSets) {
      return allSets;
    }
    return allSets.slice(0, 3);
  };

  if (sets.length === 0) return null;

  return (
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
          if (!set) return null;

          // Find the original index for proper removal
          const originalIndex = sets.findIndex((s) => s === set);
          const isEditing = editingSetIndex === originalIndex;

          return (
            <SetCard
              key={index}
              set={set}
              isEditing={isEditing}
              editingSet={editingSet}
              setEditingSet={setEditingSet}
              weightIncrement={weightIncrement}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              onEdit={() => onStartEdit(set, originalIndex)}
              onDelete={() => onRemoveSet(originalIndex)}
            />
          );
        })}
      </View>
    </View>
  );
}

