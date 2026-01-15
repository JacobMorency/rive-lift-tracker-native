import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserStats } from "../../lib/statsUtils";

type DashboardStatsProps = {
  weeklyStats: UserStats | null;
  allTimeStats: UserStats | null;
  loading: boolean;
};

export default function DashboardStats({
  weeklyStats,
  allTimeStats,
  loading,
}: DashboardStatsProps) {
  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k lbs`;
    }
    return `${Math.round(volume).toLocaleString()} lbs`;
  };

  return (
    <View className="gap-4 mb-6">
      <View className="flex-row gap-4">
        {/* Workout Streak */}
        <View className="flex-1 bg-gray-100 dark:bg-zinc-700 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="flame" size={16} color="#ff4b8c" />
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">Streak</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#ff4b8c" />
          ) : (
            <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
              {allTimeStats?.workout_streak || 0} days
            </Text>
          )}
        </View>

        {/* Sessions This Week */}
        <View className="flex-1 bg-gray-100 dark:bg-zinc-700 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="calendar" size={16} color="#10b981" />
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
              {weeklyStats?.total_sessions || 0}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row gap-4">
        {/* Volume This Week */}
        <View className="flex-1 bg-gray-100 dark:bg-zinc-700 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="barbell" size={16} color="#3b82f6" />
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
              {formatVolume(weeklyStats?.total_volume || 0)}
            </Text>
          )}
        </View>

        {/* Active Days This Month */}
        <View className="flex-1 bg-gray-100 dark:bg-zinc-700 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="checkmark-circle" size={16} color="#8b5cf6" />
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#8b5cf6" />
          ) : (
            <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
              {allTimeStats?.active_days_this_month || 0} days
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

