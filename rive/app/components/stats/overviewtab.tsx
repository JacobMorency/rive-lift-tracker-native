import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/authcontext";
import {
  DateRange,
  getUserStats,
  getMostUsedExercises,
  UserStats,
} from "../../lib/statsUtils";

type OverviewTabProps = {
  dateRange: DateRange;
};

export default function OverviewTab({ dateRange }: OverviewTabProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [mostUsedExercises, setMostUsedExercises] = useState<
    { id: number; name: string; category: string; usageCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      // Map DateRange to timeframe expected by getUserStats
      const timeframe = dateRange.type === "custom" ? "all" : dateRange.type;
      const [stats, exercises] = await Promise.all([
        getUserStats(user.id, timeframe as any),
        getMostUsedExercises(user.id, dateRange),
      ]);
      setUserStats(stats);
      setMostUsedExercises(exercises.slice(0, 5)); // Top 5 exercises
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    return "#ff4b8c"; // All badges use primary color
  };

  return (
    <ScrollView
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Summary Cards */}
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
                {(userStats?.total_volume || 0).toLocaleString()} lbs
              </Text>
            )}
          </View>
        </View>

        <View className="bg-base-300 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="trophy" size={16} color="#8b5cf6" />
            <Text className="text-sm font-medium text-muted">
              Personal Records
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#8b5cf6" />
          ) : (
            <Text className="text-2xl font-bold text-base-content">
              {userStats?.personal_records.length || 0}
            </Text>
          )}
        </View>
      </View>

      {/* Most Used Exercises */}
      {mostUsedExercises.length > 0 && (
        <View className="mb-6 bg-base-300 rounded-xl p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="list" size={20} color="#ff4b8c" />
            <Text className="text-lg font-semibold text-base-content ml-2">
              Your Top Exercises
            </Text>
          </View>

          <View className="gap-3">
            {mostUsedExercises.map((exercise, index) => (
              <View key={exercise.id} className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                  <Text className="text-xs font-bold text-primary-content">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-base font-semibold text-base-content flex-1"
                      numberOfLines={1}
                    >
                      {exercise.name}
                    </Text>
                    <Text className="text-sm text-muted ml-2">
                      {exercise.usageCount} uses
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          getCategoryColor(exercise.category) + "20",
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: getCategoryColor(exercise.category) }}
                      >
                        {exercise.category}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Personal Records */}
      {userStats?.personal_records && userStats.personal_records.length > 0 && (
        <View className="mb-6 bg-base-300 rounded-xl p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="trophy" size={20} color="#ff4b8c" />
            <Text className="text-lg font-semibold text-base-content ml-2">
              Recent Personal Records
            </Text>
          </View>

          <View className="gap-3">
            {userStats.personal_records.slice(0, 3).map((pr, index) => (
              <View
                key={`${pr.exercise_id}-${pr.max_weight}-${index}`}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-base-content">
                    {pr.exercise_name}
                  </Text>
                  <Text className="text-sm text-muted">
                    {pr.max_weight} lbs × {pr.max_reps} reps
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-semibold text-primary">
                    {formatDate(pr.date_achieved)}
                  </Text>
                </View>
              </View>
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
