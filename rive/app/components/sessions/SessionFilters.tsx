import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FilterButton from "./FilterButton";

export type DateRangeFilter = "all" | "week" | "month" | "year";
export type StatusFilter = "all" | "completed" | "in_progress";
export type SortOrder = "newest" | "oldest";

type SessionFiltersProps = {
  availableWorkouts: string[];
  selectedWorkout: string | null;
  dateRange: DateRangeFilter;
  statusFilter: StatusFilter;
  sortOrder: SortOrder;
  onWorkoutChange: (workout: string | null) => void;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onClearAll: () => void;
};

export default function SessionFilters({
  availableWorkouts,
  selectedWorkout,
  dateRange,
  statusFilter,
  sortOrder,
  onWorkoutChange,
  onDateRangeChange,
  onStatusChange,
  onSortOrderChange,
  onClearAll,
}: SessionFiltersProps) {
  const [showFilterModal, setShowFilterModal] = useState(false);

  const hasActiveFilters =
    selectedWorkout !== null || dateRange !== "all" || statusFilter !== "all";

  const getFilterCount = () => {
    let count = 0;
    if (selectedWorkout !== null) count++;
    if (dateRange !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  };

  return (
    <>
      {/* Filter Icon Button */}
      <View className="px-4 py-3">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-base-200 rounded-xl px-4 py-3"
          onPress={() => setShowFilterModal(true)}
          style={{
            shadowColor: hasActiveFilters ? "#ff4b8c" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: hasActiveFilters ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: hasActiveFilters ? 1 : 0,
            borderColor: hasActiveFilters ? "#ff4b8c" : "transparent",
          }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="filter"
              size={20}
              color={hasActiveFilters ? "#ff4b8c" : "#6b7280"}
            />
            <Text className="text-base font-medium text-base-content">
              Filters
            </Text>
            {hasActiveFilters && (
              <View className="bg-primary rounded-full px-2 py-0.5 min-w-[20px] items-center justify-center">
                <Text className="text-xs font-bold text-primary-content">
                  {getFilterCount()}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-base-200 rounded-t-3xl max-h-[85%]">
            {/* Header */}
            <View className="px-4 py-4 border-b border-base-300 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-base-content">
                Filters
              </Text>
              <View className="flex-row items-center gap-3">
                {hasActiveFilters && (
                  <TouchableOpacity
                    onPress={onClearAll}
                    className="flex-row items-center gap-1"
                  >
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                    <Text className="text-sm text-error font-medium">
                      Clear All
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              className="px-4 py-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Workout Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-base-content mb-3">
                  Workout
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    <FilterButton
                      label="All Workouts"
                      isSelected={selectedWorkout === null}
                      onPress={() => onWorkoutChange(null)}
                    />
                    {availableWorkouts.map((workout) => (
                      <FilterButton
                        key={workout}
                        label={workout}
                        isSelected={selectedWorkout === workout}
                        onPress={() => onWorkoutChange(workout)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Date Range Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-base-content mb-3">
                  Date Range
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {(
                      [
                        { key: "all", label: "All Time" },
                        { key: "week", label: "This Week" },
                        { key: "month", label: "This Month" },
                        { key: "year", label: "This Year" },
                      ] as { key: DateRangeFilter; label: string }[]
                    ).map((range) => (
                      <FilterButton
                        key={range.key}
                        label={range.label}
                        isSelected={dateRange === range.key}
                        onPress={() => onDateRangeChange(range.key)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Status Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-base-content mb-3">
                  Status
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {(
                      [
                        { key: "all", label: "All", icon: "list-outline" },
                        {
                          key: "completed",
                          label: "Completed",
                          icon: "checkmark-circle-outline",
                        },
                        {
                          key: "in_progress",
                          label: "In Progress",
                          icon: "time-outline",
                        },
                      ] as {
                        key: StatusFilter;
                        label: string;
                        icon: string;
                      }[]
                    ).map((status) => (
                      <FilterButton
                        key={status.key}
                        label={status.label}
                        isSelected={statusFilter === status.key}
                        onPress={() => onStatusChange(status.key)}
                        icon={status.icon}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Sort Order */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-base-content mb-3">
                  Sort Order
                </Text>
                <View className="flex-row gap-2">
                  <FilterButton
                    label="Newest First"
                    isSelected={sortOrder === "newest"}
                    onPress={() => onSortOrderChange("newest")}
                    icon="arrow-down"
                    flex={true}
                  />
                  <FilterButton
                    label="Oldest First"
                    isSelected={sortOrder === "oldest"}
                    onPress={() => onSortOrderChange("oldest")}
                    icon="arrow-up"
                    flex={true}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
