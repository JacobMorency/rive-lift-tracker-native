import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SessionStats } from "../../lib/statsUtils";

type RecentActivityProps = {
  recentSessions: SessionStats[];
  loading: boolean;
};

export default function RecentActivity({
  recentSessions,
  loading,
}: RecentActivityProps) {
  const router = useRouter();

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

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k lbs`;
    }
    return `${Math.round(volume).toLocaleString()} lbs`;
  };

  if (loading) {
    return (
      <View className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-6 mb-6">
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Recent Activity
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">Loading...</Text>
      </View>
    );
  }

  if (!recentSessions || recentSessions.length === 0) {
    return (
      <View className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-6 mb-6">
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Recent Activity
        </Text>
        <View className="items-center py-4">
          <Ionicons name="barbell-outline" size={32} color="#9ca3af" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            No recent sessions
          </Text>
        </View>
      </View>
    );
  }

  const displaySessions = recentSessions.slice(0, 3);

  return (
    <View className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-6 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent Activity
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/sessions")}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm text-[#ff4b8c] dark:text-[#ff6fa1] font-medium">View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#ff4b8c" />
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        {displaySessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            onPress={() => router.push(`/session/${session.id}`)}
            className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                  {session.workout_name}
                </Text>
                <View className="flex-row items-center gap-3 mt-1">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(session.started_at)}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {session.exercises_completed} exercises
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
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
  );
}

