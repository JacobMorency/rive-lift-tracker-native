import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";
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
  /** Full-width row (default) or compact pill for toolbar rows */
  triggerVariant?: "full" | "compact";
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
  triggerVariant = "full",
}: SessionFiltersProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Local state for modal selections (not applied until "Apply" is clicked)
  const [localWorkout, setLocalWorkout] = useState<string | null>(
    selectedWorkout
  );
  const [localDateRange, setLocalDateRange] =
    useState<DateRangeFilter>(dateRange);
  const [localStatusFilter, setLocalStatusFilter] =
    useState<StatusFilter>(statusFilter);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);

  // Reset local state when modal opens or props change
  useEffect(() => {
    if (showFilterModal) {
      setLocalWorkout(selectedWorkout);
      setLocalDateRange(dateRange);
      setLocalStatusFilter(statusFilter);
      setLocalSortOrder(sortOrder);
    }
  }, [showFilterModal, selectedWorkout, dateRange, statusFilter, sortOrder]);

  const hasActiveFilters =
    selectedWorkout !== null || dateRange !== "all" || statusFilter !== "all";

  const getFilterCount = () => {
    let count = 0;
    if (selectedWorkout !== null) count++;
    if (dateRange !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  };

  const handleApply = () => {
    onWorkoutChange(localWorkout);
    onDateRangeChange(localDateRange);
    onStatusChange(localStatusFilter);
    onSortOrderChange(localSortOrder);
    setShowFilterModal(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalWorkout(selectedWorkout);
    setLocalDateRange(dateRange);
    setLocalStatusFilter(statusFilter);
    setLocalSortOrder(sortOrder);
    setShowFilterModal(false);
  };

  const handleClearAll = () => {
    setLocalWorkout(null);
    setLocalDateRange("all");
    setLocalStatusFilter("all");
    // Keep sort order when clearing filters
  };

  const filterTrigger = (
    <TouchableOpacity
      className={
        triggerVariant === "compact"
          ? `flex-row items-center gap-2 rounded-full border px-3 py-1.5 bg-surfaceAlt dark:bg-surfaceAlt-dark ${
              hasActiveFilters
                ? "border-primary dark:border-primary-dark"
                : "border-border dark:border-border-dark"
            }`
          : "flex-row items-center justify-between bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3"
      }
      onPress={() => setShowFilterModal(true)}
      style={
        triggerVariant === "compact"
          ? undefined
          : {
              shadowColor: hasActiveFilters ? "#ff4b8c" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: hasActiveFilters ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: hasActiveFilters ? 1 : 0,
              borderColor: hasActiveFilters ? "#ff4b8c" : "transparent",
            }
      }
      activeOpacity={0.85}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons
          name="filter"
          size={triggerVariant === "compact" ? 16 : 20}
          color={hasActiveFilters ? "#ff4b8c" : isDark ? "#a1a1aa" : "#6b7280"}
        />
        {triggerVariant === "compact" ? (
          <AppText variant="caption" tone="muted" className="normal-case font-semibold">
            Filters
          </AppText>
        ) : (
          <Text className="text-base font-medium text-zinc-900 dark:text-white">
            Filters
          </Text>
        )}
        {hasActiveFilters && (
          <View className="bg-primary dark:bg-primary-dark rounded-full px-2 py-0.5 min-w-[20px] items-center justify-center">
            <Text className="text-xs font-bold text-white">
              {getFilterCount()}
            </Text>
          </View>
        )}
      </View>
      {triggerVariant === "full" ? (
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <>
      {triggerVariant === "compact" ? (
        filterTrigger
      ) : (
        <View className="px-4 py-3">{filterTrigger}</View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background dark:bg-background-dark rounded-t-3xl max-h-[85%]">
            {/* Header */}
            <View className="px-4 py-4 border-b border-border dark:border-border-dark flex-row items-center justify-between">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                Filters
              </Text>
              <View className="flex-row items-center gap-3">
                {(localWorkout !== null ||
                  localDateRange !== "all" ||
                  localStatusFilter !== "all") && (
                  <TouchableOpacity
                    onPress={handleClearAll}
                    className="flex-row items-center gap-1"
                  >
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                    <Text className="text-sm text-error font-medium">
                      Clear All
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleCancel}>
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
                <Text className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
                  Workout
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    <FilterButton
                      label="All Workouts"
                      isSelected={localWorkout === null}
                      onPress={() => setLocalWorkout(null)}
                    />
                    {availableWorkouts.map((workout) => (
                      <FilterButton
                        key={workout}
                        label={workout}
                        isSelected={localWorkout === workout}
                        onPress={() => setLocalWorkout(workout)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Date Range Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
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
                        isSelected={localDateRange === range.key}
                        onPress={() => setLocalDateRange(range.key)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Status Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
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
                        isSelected={localStatusFilter === status.key}
                        onPress={() => setLocalStatusFilter(status.key)}
                        icon={status.icon}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Sort Order */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
                  Sort Order
                </Text>
                <View className="flex-row gap-2">
                  <FilterButton
                    label="Newest First"
                    isSelected={localSortOrder === "newest"}
                    onPress={() => setLocalSortOrder("newest")}
                    icon="arrow-down"
                    flex={true}
                  />
                  <FilterButton
                    label="Oldest First"
                    isSelected={localSortOrder === "oldest"}
                    onPress={() => setLocalSortOrder("oldest")}
                    icon="arrow-up"
                    flex={true}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Apply Button Footer */}
            <View
              className="px-4 py-4 border-t border-border dark:border-border-dark"
              style={{
                paddingBottom: 20,
              }}
            >
              <TouchableOpacity
                className="w-full py-4 rounded-ds-control flex-row items-center justify-center bg-primary dark:bg-primary-dark"
                onPress={handleApply}
                style={{
                  shadowColor: isDark ? "#ff6fa1" : "#ff4b8c",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text className="text-white font-bold ml-2 text-lg">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
