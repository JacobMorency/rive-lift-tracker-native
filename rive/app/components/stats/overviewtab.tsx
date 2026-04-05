import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/authcontext";
import {
  DateRange,
  getUserStats,
  getMostUsedExercises,
  getVolumeByMuscleGroup,
  UserStats,
} from "../../lib/statsUtils";
import AppText from "../ui/AppText";
import AppCard from "../ui/AppCard";

type OverviewTabProps = {
  dateRange: DateRange;
};

export default function OverviewTab({ dateRange }: OverviewTabProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";
  const spinnerColor = primaryIcon;

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [mostUsedExercises, setMostUsedExercises] = useState<
    Array<{
      id: number;
      name: string;
      muscleGroups?: import("../../lib/muscleGroupUtils").MuscleGroup[];
      primaryMuscleGroup?: string;
      usageCount: number;
      progressionTrend: "up" | "down" | "stable";
      progressionPercentage: number;
    }>
  >([]);
  const [muscleGroupVolumes, setMuscleGroupVolumes] = useState<
    Array<{
      muscleGroup: string;
      totalVolume: number;
      percentage: number;
      color: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const timeframe = dateRange.type === "custom" ? "all" : dateRange.type;
      const [stats, exercises, muscleGroups] = await Promise.all([
        getUserStats(user.id, timeframe as any),
        getMostUsedExercises(user.id, dateRange),
        getVolumeByMuscleGroup(user.id, dateRange),
      ]);
      setUserStats(stats);
      setMostUsedExercises(exercises.slice(0, 10));
      setMuscleGroupVolumes(muscleGroups.slice(0, 6));
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, dateRange]);

  useEffect(() => {
    if (user?.id) {
      fetchOverviewData();
    }
  }, [user?.id, dateRange, fetchOverviewData]);

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k lbs`;
    }
    return `${Math.round(volume).toLocaleString()} lbs`;
  };

  const getProgressionIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "trending-up";
      case "down":
        return "trending-down";
      default:
        return "remove";
    }
  };

  const getProgressionColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "#10b981";
      case "down":
        return "#ef4444";
      default:
        return "#9ca3af";
    }
  };

  const statTile = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    valueNode: React.ReactNode,
  ) => (
    <View className="min-h-[132] flex-1 rounded-ds-card border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color={primaryIcon} />
        <AppText variant="caption" tone="muted" className="normal-case">
          {label}
        </AppText>
      </View>
      {valueNode}
    </View>
  );

  return (
    <View>
      <View className="mb-6 gap-4">
        <View className="flex-row gap-4">
          {statTile(
            "calendar",
            "Total sessions",
            loading ? (
              <ActivityIndicator size="small" color={spinnerColor} />
            ) : (
              <AppText variant="header" tone="default">
                {userStats?.total_sessions ?? 0}
              </AppText>
            ),
          )}
          {statTile(
            "barbell",
            "Total volume",
            loading ? (
              <ActivityIndicator size="small" color={spinnerColor} />
            ) : (
              <AppText variant="header" tone="default">
                {formatVolume(userStats?.total_volume ?? 0)}
              </AppText>
            ),
          )}
        </View>
        <View className="flex-row gap-4">
          {statTile(
            "flame",
            "Workout streak",
            loading ? (
              <ActivityIndicator size="small" color={spinnerColor} />
            ) : (
              <AppText variant="header" tone="default">
                {userStats?.workout_streak ?? 0} days
              </AppText>
            ),
          )}
          {statTile(
            "checkmark-circle",
            "Active days (month)",
            loading ? (
              <ActivityIndicator size="small" color={spinnerColor} />
            ) : (
              <AppText variant="header" tone="default">
                {userStats?.active_days_this_month ?? 0}
              </AppText>
            ),
          )}
        </View>
      </View>

      {muscleGroupVolumes.length > 0 && (
        <AppCard className="mb-6 p-6" surface="default">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-6 w-1.5 rounded-full bg-primary dark:bg-primary-dark" />
            <Ionicons name="body" size={20} color={primaryIcon} />
            <AppText variant="subheader" tone="default">
              Volume by muscle group
            </AppText>
          </View>
          <View className="gap-3">
            {muscleGroupVolumes.map((group, index) => (
              <View key={group.muscleGroup} className="gap-2">
                <View className="flex-row items-center justify-between">
                  <AppText variant="body" tone="default" className="font-semibold">
                    {group.muscleGroup}
                  </AppText>
                  <View className="flex-row items-center gap-2">
                    <AppText variant="caption" tone="muted" className="normal-case">
                      {formatVolume(group.totalVolume)}
                    </AppText>
                    <AppText variant="caption" tone="primary" className="font-semibold normal-case">
                      {group.percentage}%
                    </AppText>
                  </View>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark">
                  <View
                    className={`h-full rounded-full ${
                      index === 0
                        ? "bg-primary dark:bg-primary-dark"
                        : "bg-textMuted/45 dark:bg-textMuted-dark/45"
                    }`}
                    style={{ width: `${group.percentage}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </AppCard>
      )}

      {mostUsedExercises.length > 0 && (
        <AppCard className="mb-6 p-6" surface="default">
          <View className="mb-4 flex-row items-center gap-2">
            <Ionicons name="list" size={20} color={primaryIcon} />
            <AppText variant="subheader" tone="default">
              Most used exercises
            </AppText>
          </View>
          <View className="gap-3">
            {mostUsedExercises.map((exercise, index) => (
              <View
                key={exercise.id}
                className="flex-row items-center gap-3 rounded-ds-control border border-border bg-surfaceAlt p-3 dark:border-border-dark dark:bg-surfaceAlt-dark"
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary dark:bg-primary-dark">
                  <AppText variant="caption" tone="inverse" className="font-bold normal-case">
                    {index + 1}
                  </AppText>
                </View>
                <View className="min-w-0 flex-1">
                  <View className="mb-1 flex-row items-center justify-between">
                    <AppText
                      variant="body"
                      tone="default"
                      className="flex-1 font-semibold"
                      numberOfLines={2}
                    >
                      {exercise.name}
                    </AppText>
                    <View className="flex-row items-center gap-2">
                      {exercise.progressionTrend !== "stable" && (
                        <Ionicons
                          name={getProgressionIcon(exercise.progressionTrend)}
                          size={14}
                          color={getProgressionColor(exercise.progressionTrend)}
                        />
                      )}
                      <AppText variant="caption" tone="muted" className="normal-case">
                        {exercise.usageCount} uses
                      </AppText>
                    </View>
                  </View>
                  <View className="flex-row flex-wrap items-center gap-2">
                    {exercise.primaryMuscleGroup && (
                      <View className="rounded-full bg-primary/15 px-2 py-1 dark:bg-primary-dark/20">
                        <AppText variant="caption" tone="primary" className="font-medium normal-case">
                          {exercise.primaryMuscleGroup}
                        </AppText>
                      </View>
                    )}
                    {exercise.progressionPercentage !== 0 && (
                      <AppText
                        variant="caption"
                        className="font-medium normal-case"
                        style={{
                          color: getProgressionColor(exercise.progressionTrend),
                        }}
                      >
                        {exercise.progressionTrend === "up" ? "+" : ""}
                        {exercise.progressionPercentage.toFixed(0)}% volume
                      </AppText>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </AppCard>
      )}

      {!loading && (!userStats || userStats.total_sessions === 0) && (
        <View className="items-center justify-center py-12">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark">
            <Ionicons name="barbell-outline" size={40} color={isDark ? "#a1a1aa" : "#6b7280"} />
          </View>
          <AppText variant="header" tone="default" className="mb-2 text-center">
            No workouts yet
          </AppText>
          <AppText variant="body" tone="muted" className="max-w-xs text-center normal-case">
            Start tracking your workouts to see your progress and personal records here.
          </AppText>
        </View>
      )}
    </View>
  );
}
