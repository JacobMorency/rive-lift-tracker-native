import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authcontext";
import {
  DateRange,
  getUserStats,
  getMostUsedExercises,
  getVolumeByMuscleGroup,
  UserStats,
} from "../../lib/statsUtils";

type OverviewTabProps = {
  dateRange: DateRange;
};

export default function OverviewTab({ dateRange }: OverviewTabProps) {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [mostUsedExercises, setMostUsedExercises] = useState<
    Array<{
      id: number;
      name: string;
      muscleGroups?: import("../../lib/muscleGroupUtils").MuscleGroup[];
      primaryMuscleGroup?: string; // Replaces category
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
      // Map DateRange to timeframe expected by getUserStats
      const timeframe = dateRange.type === "custom" ? "all" : dateRange.type;
      const [stats, exercises, muscleGroups] = await Promise.all([
        getUserStats(user.id, timeframe as any),
        getMostUsedExercises(user.id, dateRange),
        getVolumeByMuscleGroup(user.id, dateRange),
      ]);
      setUserStats(stats);
      setMostUsedExercises(exercises.slice(0, 10)); // Top 10 exercises
      setMuscleGroupVolumes(muscleGroups.slice(0, 6)); // Top 6 muscle groups
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === today.getTime()) {
      return "Today";
    } else if (sessionDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      const daysDiff = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${daysDiff} days ago`;
    }
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

  return (
    <ScrollView
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Summary Cards - 2x2 Grid */}
      <View className="gap-4 mb-6">
        <View className="flex-row gap-4">
          <View className="flex-1 bg-base-300 rounded-lg p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="calendar" size={16} color="#ff4b8c" />
              <Text className="text-sm font-medium text-muted">
                Total Sessions
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#ff4b8c" />
            ) : (
              <Text className="text-2xl font-bold text-base-content">
                {userStats?.total_sessions || 0}
              </Text>
            )}
          </View>
          <View className="flex-1 bg-base-300 rounded-lg p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="barbell" size={16} color="#10b981" />
              <Text className="text-sm font-medium text-muted">
                Total Volume
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text className="text-2xl font-bold text-base-content">
                {formatVolume(userStats?.total_volume || 0)}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 bg-base-300 rounded-lg p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="flame" size={16} color="#f59e0b" />
              <Text className="text-sm font-medium text-muted">
                Workout Streak
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#f59e0b" />
            ) : (
              <Text className="text-2xl font-bold text-base-content">
                {userStats?.workout_streak || 0} days
              </Text>
            )}
          </View>
          <View className="flex-1 bg-base-300 rounded-lg p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              <Text className="text-sm font-medium text-muted">
                Active Days (Month)
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Text className="text-2xl font-bold text-base-content">
                {userStats?.active_days_this_month || 0}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Volume by Muscle Group */}
      {muscleGroupVolumes.length > 0 && (
        <View className="mb-6 bg-base-300 rounded-xl p-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="body" size={20} color="#ff4b8c" />
            <Text className="text-lg font-semibold text-base-content">
              Volume by Muscle Group
            </Text>
          </View>
          <View className="gap-3">
            {muscleGroupVolumes.map((group) => (
              <View key={group.muscleGroup} className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-base-content">
                    {group.muscleGroup}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm text-muted">
                      {formatVolume(group.totalVolume)}
                    </Text>
                    <Text className="text-sm font-medium text-primary">
                      {group.percentage}%
                    </Text>
                  </View>
                </View>
                {/* Progress Bar */}
                <View className="h-2 bg-base-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${group.percentage}%`,
                      backgroundColor: group.color,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Most Used Exercises */}
      {mostUsedExercises.length > 0 && (
        <View className="mb-6 bg-base-300 rounded-xl p-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="list" size={20} color="#ff4b8c" />
            <Text className="text-lg font-semibold text-base-content">
              Most Used Exercises
            </Text>
          </View>
          <View className="gap-3">
            {mostUsedExercises.map((exercise, index) => (
              <View
                key={exercise.id}
                className="flex-row items-center gap-3 bg-base-200 rounded-lg p-3"
              >
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Text className="text-xs font-bold text-primary-content">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-semibold text-base-content flex-1">
                      {exercise.name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      {exercise.progressionTrend !== "stable" && (
                        <Ionicons
                          name={getProgressionIcon(exercise.progressionTrend)}
                          size={14}
                          color={getProgressionColor(exercise.progressionTrend)}
                        />
                      )}
                      <Text className="text-sm text-muted">
                        {exercise.usageCount} uses
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: "#ff4b8c20",
                      }}
                    >
                      {exercise.primaryMuscleGroup && (
                        <Text
                          className="text-xs font-medium"
                          style={{ color: "#ff4b8c" }}
                        >
                          {exercise.primaryMuscleGroup}
                        </Text>
                      )}
                    </View>
                    {exercise.progressionPercentage !== 0 && (
                      <Text
                        className="text-xs font-medium"
                        style={{
                          color: getProgressionColor(exercise.progressionTrend),
                        }}
                      >
                        {exercise.progressionTrend === "up" ? "+" : ""}
                        {exercise.progressionPercentage.toFixed(0)}% volume
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activity */}
      {userStats?.recent_sessions && userStats.recent_sessions.length > 0 && (
        <View className="mb-6 bg-base-300 rounded-xl p-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="time" size={20} color="#ff4b8c" />
              <Text className="text-lg font-semibold text-base-content">
                Recent Activity
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/sessions")}
              className="flex-row items-center gap-1"
            >
              <Text className="text-sm text-primary font-medium">View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#ff4b8c" />
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {userStats.recent_sessions.slice(0, 10).map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => router.push(`/session/${session.id}`)}
                className="bg-base-200 rounded-lg p-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-base-content">
                      {session.workout_name}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      <Text className="text-xs text-muted">
                        {formatDate(session.started_at)}
                      </Text>
                      <Text className="text-xs text-muted">
                        {session.exercises_completed} exercises
                      </Text>
                      <Text className="text-xs text-muted">
                        {formatVolume(session.total_volume)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {!loading && (!userStats || userStats.total_sessions === 0) && (
        <View className="flex-1 justify-center items-center py-12">
          <View className="items-center">
            <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
              <Ionicons name="barbell-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-base-content mb-2">
              No Workouts Yet
            </Text>
            <Text className="text-center text-muted max-w-xs">
              Start tracking your workouts to see your progress and personal
              records here.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
