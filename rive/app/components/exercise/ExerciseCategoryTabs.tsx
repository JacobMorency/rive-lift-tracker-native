import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
          Filter by Category
        </Text>
        {selectedCount > 0 && (
          <TouchableOpacity
            onPress={onClearAll}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="close-circle" size={16} color="#ef4444" />
            <Text className="text-sm text-error">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`px-4 py-3 rounded-xl flex-row items-center gap-2 ${
              selectedFilter === "" ? "bg-[#ff4b8c] dark:bg-[#ff6fa1]" : "bg-gray-100 dark:bg-zinc-700"
            }`}
            onPress={() => onFilterChange("")}
            style={{
              shadowColor: selectedFilter === "" ? "#ff4b8c" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons
              name="grid"
              size={16}
              color={selectedFilter === "" ? "#ffffff" : "#6b7280"}
            />
            <Text
              className={`text-sm font-medium ${
                selectedFilter === ""
                  ? "text-white"
                  : "text-zinc-900 dark:text-white"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>

          {["Chest", "Back", "Legs", "Arms"].map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-3 rounded-xl ${
                selectedFilter === filter ? "bg-[#ff4b8c] dark:bg-[#ff6fa1]" : "bg-gray-100 dark:bg-zinc-700"
              }`}
              onPress={() => onFilterChange(filter)}
              style={{
                shadowColor:
                  selectedFilter === filter ? "#ff4b8c" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === filter
                    ? "text-white"
                    : "text-zinc-900 dark:text-white"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

