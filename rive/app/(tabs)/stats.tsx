import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { getUserStats, Timeframe, UserStats } from "../lib/statsUtils";
import Header from "../components/header";

export default function StatsPage() {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();

  const [userStats, setUserStats] = useState<UserStats>({
    total_sessions: 0,
    total_volume: 0,
    workout_streak: 0,
    active_days_this_month: 0,
    personal_records: [],
    recent_sessions: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("all");

  const fetchUserStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setStatsLoading(true);
      const stats = await getUserStats(user.id, selectedTimeframe);
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id, selectedTimeframe]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return (
    <View className="flex-1 bg-base-100">
      <Header
        title="Stats"
        subtitle={
          userData
            ? `Your fitness progress, ${userData.first_name} 📊`
            : undefined
        }
      />

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View>
          {/* Timeframe Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-base-content mb-3">
              Time Period
            </Text>
            <View className="flex-row gap-2">
              {(["week", "month", "year", "all"] as Timeframe[]).map(
                (timeframe) => (
                  <TouchableOpacity
                    key={timeframe}
                    onPress={() => setSelectedTimeframe(timeframe)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedTimeframe === timeframe
                        ? "bg-primary"
                        : "bg-base-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedTimeframe === timeframe
                          ? "text-primary-content"
                          : "text-base-content"
                      }`}
                    >
                      {timeframe === "all"
                        ? "All Time"
                        : timeframe.charAt(0).toUpperCase() +
                          timeframe.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Enhanced Stats Card */}
          <View
            className="bg-base-300 rounded-xl p-6 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-6">
              <Ionicons name="stats-chart" size={24} color="#ff4b8c" />
              <Text className="text-xl font-bold text-base-content ml-3">
                Your Progress
              </Text>
            </View>

            {/* Stats Grid */}
            <View className="gap-4">
              <View className="flex-row gap-4">
                <View className="flex-1 bg-base-200 rounded-lg p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="play-circle" size={16} color="#ff4b8c" />
                    <Text className="text-sm font-medium text-muted">
                      Sessions
                    </Text>
                  </View>
                  {statsLoading ? (
                    <ActivityIndicator size="small" color="#ff4b8c" />
                  ) : (
                    <Text className="text-2xl font-bold text-base-content">
                      {userStats.total_sessions}
                    </Text>
                  )}
                </View>
                <View className="flex-1 bg-base-200 rounded-lg p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="barbell" size={16} color="#10b981" />
                    <Text className="text-sm font-medium text-muted">
                      Volume (lbs)
                    </Text>
                  </View>
                  {statsLoading ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <Text className="text-2xl font-bold text-base-content">
                      {userStats.total_volume.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 bg-base-200 rounded-lg p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="flame" size={16} color="#f59e0b" />
                    <Text className="text-sm font-medium text-muted">
                      Streak
                    </Text>
                  </View>
                  {statsLoading ? (
                    <ActivityIndicator size="small" color="#f59e0b" />
                  ) : (
                    <Text className="text-2xl font-bold text-base-content">
                      {userStats.workout_streak}
                    </Text>
                  )}
                </View>
                <View className="flex-1 bg-base-200 rounded-lg p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="calendar" size={16} color="#3b82f6" />
                    <Text className="text-sm font-medium text-muted">
                      Active Days
                    </Text>
                  </View>
                  {statsLoading ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Text className="text-2xl font-bold text-base-content">
                      {userStats.active_days_this_month}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Personal Records Section */}
          {userStats.personal_records.length > 0 && (
            <View
              className="bg-base-300 rounded-xl p-6 mb-6"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center mb-6">
                <Ionicons name="trophy" size={24} color="#ff4b8c" />
                <Text className="text-xl font-bold text-base-content ml-3">
                  Personal Records
                </Text>
              </View>

              <View className="gap-3">
                {userStats.personal_records.slice(0, 5).map((pr, index) => (
                  <View
                    key={pr.exercise_id}
                    className="bg-base-200 rounded-lg p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-base-content">
                          {pr.exercise_name}
                        </Text>
                        <Text className="text-sm text-muted">
                          {pr.category}
                        </Text>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center gap-2">
                          <View className="bg-primary/10 px-2 py-1 rounded">
                            <Text className="text-primary text-sm font-bold">
                              {pr.max_weight} lbs
                            </Text>
                          </View>
                          <View className="bg-success/10 px-2 py-1 rounded">
                            <Text className="text-success text-sm font-bold">
                              {pr.max_reps} reps
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-muted mt-1">
                          {new Date(pr.date_achieved).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recent Sessions Section */}
          {userStats.recent_sessions.length > 0 && (
            <View
              className="bg-base-300 rounded-xl p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center mb-6">
                <Ionicons name="time" size={24} color="#ff4b8c" />
                <Text className="text-xl font-bold text-base-content ml-3">
                  Recent Sessions
                </Text>
              </View>

              <View className="gap-3">
                {userStats.recent_sessions.slice(0, 5).map((session) => (
                  <View key={session.id} className="bg-base-200 rounded-lg p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-base-content">
                          {session.workout_name}
                        </Text>
                        <Text className="text-sm text-muted">
                          {new Date(session.started_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-primary">
                          {session.total_volume.toLocaleString()} lbs
                        </Text>
                        <Text className="text-xs text-muted">
                          {session.total_sets} sets
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
