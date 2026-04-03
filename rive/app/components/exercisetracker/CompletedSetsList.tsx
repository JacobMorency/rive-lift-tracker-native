import React, { type RefObject } from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import SetCard from "./SetCard";
import AppText from "../ui/AppText";
import type { PadField } from "./exercisePadUtils";

type PadContext = { type: "active" } | { type: "edit"; index: number };

type CompletedSetsListProps = {
  sets: ExerciseSet[];
  showAllSets: boolean;
  setShowAllSets: (value: boolean) => void;
  editingSetIndex: number | null;
  editingSet: ExerciseSet | null;
  setEditingSet: (set: ExerciseSet | null) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (set: ExerciseSet, index: number) => void;
  onRemoveSet: (index: number) => void;
  padContext: PadContext;
  padOpen: boolean;
  padField: PadField;
  padBuffer: string;
  onFocusEditField: (field: PadField) => void;
  editSectionRef?: RefObject<View | null>;
};

export default function CompletedSetsList({
  sets,
  showAllSets,
  setShowAllSets,
  editingSetIndex,
  editingSet,
  setEditingSet,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onRemoveSet,
  padContext,
  padOpen,
  padField,
  padBuffer,
  onFocusEditField,
  editSectionRef,
}: CompletedSetsListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const chevronColor = isDark ? "#a1a1aa" : "#6b7280";
  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";

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
    <View className="bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-ds-card border border-border dark:border-border-dark p-5 mb-4">
      <View className="flex-row items-center justify-between mb-4 gap-2">
        <View className="flex-row items-center gap-2 flex-1 min-w-0">
          <Ionicons name="checkmark-circle" size={20} color={primaryIcon} />
          <AppText variant="subheader" tone="default" className="font-bold">
            Completed sets
          </AppText>
        </View>
        <View className="flex-row items-center gap-2 shrink-0">
          <View className="bg-primary/10 dark:bg-primary-dark/10 px-3 py-1 rounded-full border border-primary/25 dark:border-primary-dark/25">
            <AppText variant="body" tone="primary" className="text-sm font-bold">
              {sets.length}
            </AppText>
          </View>
          {sets.length > 3 && (
            <TouchableOpacity
              onPress={() => setShowAllSets(!showAllSets)}
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-1 rounded-full"
            >
              <View className="flex-row items-center gap-1">
                <AppText variant="body" tone="default" className="text-sm font-medium">
                  {showAllSets ? "Show less" : "Show all"}
                </AppText>
                <Ionicons
                  name={showAllSets ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={chevronColor}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View className="gap-3">
        {getDisplaySets().map((set, index) => {
          if (!set) return null;

          const originalIndex = sets.findIndex((s) => s === set);
          const isEditing = editingSetIndex === originalIndex;
          const isPadTarget =
            padContext.type === "edit" && padContext.index === originalIndex;

          return (
            <SetCard
              key={index}
              set={set}
              isEditing={isEditing}
              editingSet={editingSet}
              setEditingSet={setEditingSet}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              onEdit={() => onStartEdit(set, originalIndex)}
              onDelete={() => onRemoveSet(originalIndex)}
              isPadTarget={isPadTarget}
              padOpen={padOpen}
              padField={padField}
              padBuffer={padBuffer}
              onFocusPadField={onFocusEditField}
              editSectionRef={isEditing ? editSectionRef : undefined}
            />
          );
        })}
      </View>
    </View>
  );
}
