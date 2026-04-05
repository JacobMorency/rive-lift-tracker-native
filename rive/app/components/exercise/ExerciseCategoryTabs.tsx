import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import AppText from "../ui/AppText";

type ExerciseCategoryTabsProps = {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedCount: number;
  onClearAll: () => void;
};

export default function ExerciseCategoryTabs({
  selectedFilter,
  onFilterChange,
  selectedCount,
  onClearAll,
}: ExerciseCategoryTabsProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <AppText variant="caption" tone="muted">
          Filter by Category
        </AppText>

        {selectedCount > 0 && (
          <TouchableOpacity
            onPress={onClearAll}
            className="flex-row items-center gap-1"
          >
            <AppText
              variant="body"
              tone="primary"
              className="normal-case text-xs"
            >
              CLEAR ALL
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`px-6 rounded-full flex-row items-center ${
              selectedFilter === ""
                ? "bg-primary dark:bg-primary-dark"
                : "bg-background dark:bg-surfaceAlt-dark"
            }`}
            onPress={() => onFilterChange("")}
          >
            <AppText
              variant="caption"
              tone={selectedFilter === "" ? "inverse" : "muted"}
              className="font-bold"
            >
              All
            </AppText>
          </TouchableOpacity>

          {["Chest", "Back", "Legs", "Arms"].map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-6 py-1 rounded-full ${
                selectedFilter === filter
                  ? "bg-primary dark:bg-primary-dark"
                  : "bg-surfaceAlt dark:bg-surfaceAlt-dark"
              }`}
              onPress={() => onFilterChange(filter)}
            >
              <AppText
                variant="caption"
                tone={selectedFilter === filter ? "inverse" : "muted"}
                className="font-bold"
              >
                {filter}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
