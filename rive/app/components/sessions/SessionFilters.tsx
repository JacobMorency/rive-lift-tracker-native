import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  useColorScheme,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../ui/AppText";
import FilterButton from "./FilterButton";

export type DateRangeFilter = "all" | "week" | "month" | "year";
export type StatusFilter = "all" | "completed" | "in_progress";
export type SortOrder = "newest" | "oldest";

const SCROLL_BOTTOM_FOR_STICKY_CTA = 140;

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
  onClearAll: _onClearAll,
  triggerVariant = "full",
}: SessionFiltersProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [localWorkout, setLocalWorkout] = useState<string | null>(
    selectedWorkout,
  );
  const [localDateRange, setLocalDateRange] =
    useState<DateRangeFilter>(dateRange);
  const [localStatusFilter, setLocalStatusFilter] =
    useState<StatusFilter>(statusFilter);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);

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

  const handleApplyFilters = () => {
    onWorkoutChange(localWorkout);
    onDateRangeChange(localDateRange);
    onStatusChange(localStatusFilter);
    onSortOrderChange(localSortOrder);
    setShowFilterModal(false);
  };

  const handleCancel = () => {
    setLocalWorkout(selectedWorkout);
    setLocalDateRange(dateRange);
    setLocalStatusFilter(statusFilter);
    setLocalSortOrder(sortOrder);
    setShowFilterModal(false);
  };

  const handleReset = () => {
    setLocalWorkout(null);
    setLocalDateRange("all");
    setLocalStatusFilter("all");
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
          <AppText
            variant="caption"
            tone="muted"
            className="normal-case font-semibold"
          >
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

  const footerFadeColors = isDark
    ? (["rgba(15,15,16,0)", "#0f0f10"] as const)
    : (["rgba(255,255,255,0)", "#ffffff"] as const);

  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";

  return (
    <>
      {triggerVariant === "compact" ? (
        filterTrigger
      ) : (
        <View className="px-4 py-3">{filterTrigger}</View>
      )}

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-end bg-black/60">
          <Pressable
            className="absolute inset-0"
            onPress={handleCancel}
            accessibilityLabel="Dismiss filters"
          />
          <View
            className="h-[88%] w-full overflow-hidden rounded-t-3xl bg-background dark:bg-background-dark"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 24,
              zIndex: 1,
            }}
          >
            <View className="flex-1">
              {/* Top bar */}
              <View className="flex-row items-center border-b border-border px-6 pb-3 pt-4 dark:border-border-dark">
                <View className="flex-1 items-start">
                  <TouchableOpacity
                    onPress={handleCancel}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Close filters"
                  >
                    <Ionicons name="close" size={26} color={primaryIcon} />
                  </TouchableOpacity>
                </View>
                <View className="flex-1 items-center">
                  <AppText
                    variant="caption"
                    className="font-bold tracking-tight"
                  >
                    Filters
                  </AppText>
                </View>
                <View className="flex-1 items-end">
                  <TouchableOpacity
                    onPress={handleReset}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Reset filters"
                  >
                    <AppText
                      variant="caption"
                      tone="primary"
                      className="font-bold normal-case"
                    >
                      Reset
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                className="flex-1"
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingTop: 16,
                  paddingBottom: SCROLL_BOTTOM_FOR_STICKY_CTA + insets.bottom,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View className="mb-10">
                  <AppText
                    variant="caption"
                    tone="muted"
                    className="mb-4 font-bold"
                    style={{ letterSpacing: 2 }}
                  >
                    Workout
                  </AppText>
                  <View className="flex-row flex-wrap gap-2">
                    <FilterButton
                      label="All Workouts"
                      isSelected={localWorkout === null}
                      onPress={() => setLocalWorkout(null)}
                      variant="pill"
                    />
                    {availableWorkouts.map((workout) => (
                      <FilterButton
                        key={workout}
                        label={workout}
                        isSelected={localWorkout === workout}
                        onPress={() => setLocalWorkout(workout)}
                        variant="pill"
                      />
                    ))}
                  </View>
                </View>

                <View className="mb-10">
                  <AppText
                    variant="caption"
                    tone="muted"
                    className="mb-4 font-bold"
                    style={{ letterSpacing: 2 }}
                  >
                    Date Range
                  </AppText>
                  <View className="flex-row flex-wrap gap-3">
                    {(
                      [
                        { key: "all", label: "All Time" },
                        { key: "week", label: "This Week" },
                        { key: "month", label: "This Month" },
                        { key: "year", label: "This Year" },
                      ] as { key: DateRangeFilter; label: string }[]
                    ).map((range) => (
                      <View key={range.key} style={{ width: "47%" }}>
                        <FilterButton
                          label={range.label}
                          isSelected={localDateRange === range.key}
                          onPress={() => setLocalDateRange(range.key)}
                          flex
                        />
                      </View>
                    ))}
                  </View>
                </View>

                <View className="mb-10">
                  <AppText
                    variant="caption"
                    tone="muted"
                    className="mb-4 font-bold"
                    style={{ letterSpacing: 2 }}
                  >
                    Status
                  </AppText>
                  <View className="flex-row flex-wrap gap-2">
                    {(
                      [
                        { key: "all", label: "All" },
                        { key: "completed", label: "Completed" },
                        { key: "in_progress", label: "In Progress" },
                      ] as { key: StatusFilter; label: string }[]
                    ).map((status) => (
                      <FilterButton
                        key={status.key}
                        label={status.label}
                        isSelected={localStatusFilter === status.key}
                        onPress={() => setLocalStatusFilter(status.key)}
                        variant="pill"
                      />
                    ))}
                  </View>
                </View>

                <View className="mb-6">
                  <AppText
                    variant="caption"
                    tone="muted"
                    className="mb-4 font-bold"
                    style={{ letterSpacing: 2 }}
                  >
                    Sort Order
                  </AppText>
                  <View className="flex-row gap-3">
                    <FilterButton
                      label="Newest First"
                      isSelected={localSortOrder === "newest"}
                      onPress={() => setLocalSortOrder("newest")}
                      icon="arrow-down"
                      flex
                      variant="sort"
                    />
                    <FilterButton
                      label="Oldest First"
                      isSelected={localSortOrder === "oldest"}
                      onPress={() => setLocalSortOrder("oldest")}
                      icon="arrow-up"
                      flex
                      variant="sort"
                    />
                  </View>
                </View>
              </ScrollView>

              <LinearGradient
                colors={[...footerFadeColors]}
                locations={[0, 0.45]}
                pointerEvents="box-none"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  paddingTop: 40,
                  paddingHorizontal: 24,
                  paddingBottom: Math.max(insets.bottom, 20),
                }}
              >
                <TouchableOpacity
                  onPress={handleApplyFilters}
                  activeOpacity={0.92}
                  accessibilityLabel="Apply filters"
                >
                  <LinearGradient
                    colors={["#ff4b8c", "#ff6fa1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 12,
                      paddingVertical: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#ff4b8c",
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.35,
                      shadowRadius: 18,
                      elevation: 12,
                    }}
                  >
                    <AppText
                      tone="inverse"
                      variant="body"
                      className="font-black uppercase tracking-widest"
                      style={{ fontSize: 13, letterSpacing: 2 }}
                    >
                      Apply Filters
                    </AppText>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
