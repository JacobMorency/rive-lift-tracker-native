import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import SetCard from "./SetCard";
import AppText from "../ui/AppText";

type CompletedSetsListProps = {
  sets: ExerciseSet[];
  showAllSets: boolean;
  setShowAllSets: (value: boolean) => void;
  editingSetIndex: number | null;
  onStartEdit: (set: ExerciseSet, index: number) => void;
  onRemoveSet: (index: number) => void;
};

export default function CompletedSetsList({
  sets,
  showAllSets,
  setShowAllSets,
  editingSetIndex,
  onStartEdit,
  onRemoveSet,
}: CompletedSetsListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const chevronColor = isDark ? "#a1a1aa" : "#6b7280";

  const getDisplaySets = () => {
    if (!sets || sets.length === 0) return [];
    const allSets = [...sets].reverse().filter((set) => set != null);
    if (sets.length <= 3 || showAllSets) {
      return allSets;
    }
    return allSets.slice(0, 3);
  };

  if (sets.length === 0) return null;

  const n = sets.length;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between px-1 mb-3 gap-2">
        <AppText
          variant="caption"
          tone="muted"
          className="text-[10px] font-black uppercase tracking-widest flex-1 min-w-0"
        >
          Completed history
        </AppText>
        <View className="flex-row items-center gap-2 shrink-0">
          <AppText variant="caption" tone="primary" className="text-[10px] font-bold uppercase">
            {n} {n === 1 ? "set" : "sets"} done
          </AppText>
          {sets.length > 3 && (
            <TouchableOpacity
              onPress={() => setShowAllSets(!showAllSets)}
              className="flex-row items-center gap-0.5"
            >
              <AppText variant="caption" tone="default" className="text-[10px] font-semibold">
                {showAllSets ? "Less" : "All"}
              </AppText>
              <Ionicons
                name={showAllSets ? "chevron-up" : "chevron-down"}
                size={12}
                color={chevronColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View className="gap-2">
        {getDisplaySets().map((set, index) => {
          if (!set) return null;

          const originalIndex = sets.findIndex((s) => s === set);

          return (
            <SetCard
              key={`${originalIndex}-${set.set_number}`}
              set={set}
              originalIndex={originalIndex}
              editingSetIndex={editingSetIndex}
              onEdit={() => onStartEdit(set, originalIndex)}
              onDelete={() => onRemoveSet(originalIndex)}
            />
          );
        })}
      </View>
    </View>
  );
}
