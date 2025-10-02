import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userStats, setUserStats] = useState({
    totalWorkouts: 0,
    totalSessions: 0,
    thisMonthSessions: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      setStatsLoading(true);

      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from("workouts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get total sessions
      const { count: totalSessions } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get this month's sessions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonthSessions } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("started_at", startOfMonth.toISOString());

      setUserStats({
        totalWorkouts: totalWorkouts || 0,
        totalSessions: totalSessions || 0,
        thisMonthSessions: thisMonthSessions || 0,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Error", "Failed to logout");
        console.error("Logout error:", error);
        return;
      }

      // Navigate to login page after successful logout
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
      console.error("Logout error:", error);
    }
  };

  return (
    <View className="flex-1 bg-base-100">
      {/* Header */}
      <View
        className="bg-base-200 px-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <Text className="text-2xl font-bold text-base-content">Profile</Text>
        {userData && (
          <Text className="text-muted mt-1">
            Manage your account and settings
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        <View>
          {/* User Info Card */}
          <View
            className="bg-base-300 rounded-lg p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <View className="items-center mb-4">
              <View className="bg-primary rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <Ionicons name="person" size={32} color="#ffffff" />
              </View>
              {userData && (
                <Text className="text-xl font-semibold text-base-content">
                  {userData.first_name} {userData.last_name}
                </Text>
              )}
              {user && <Text className="text-muted mt-1">{user.email}</Text>}
            </View>
          </View>

          <View className="mb-6" />

          {/* Stats Card */}
          <View
            className="bg-base-300 rounded-lg p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="stats-chart" size={20} color="#ff4b8c" />
              <Text className="text-lg font-semibold text-base-content ml-2">
                Your Stats
              </Text>
            </View>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-muted">Total Workouts</Text>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#ff4b8c" />
                ) : (
                  <Text className="font-medium text-base-content">
                    {userStats.totalWorkouts}
                  </Text>
                )}
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Total Sessions</Text>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#ff4b8c" />
                ) : (
                  <Text className="font-medium text-base-content">
                    {userStats.totalSessions}
                  </Text>
                )}
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">This Month</Text>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#ff4b8c" />
                ) : (
                  <Text className="font-medium text-base-content">
                    {userStats.thisMonthSessions}
                  </Text>
                )}
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Member Since</Text>
                <Text className="font-medium text-base-content">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6" />

          {/* Settings Card */}
          <View
            className="bg-base-300 rounded-lg p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="settings" size={20} color="#ff4b8c" />
              <Text className="text-lg font-semibold text-base-content ml-2">
                Settings
              </Text>
            </View>
            <View className="space-y-3">
              <TouchableOpacity className="py-3 border-b border-base-200">
                <Text className="text-base-content">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3 border-b border-base-200">
                <Text className="text-base-content">Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3 border-b border-base-200">
                <Text className="text-base-content">Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3">
                <Text className="text-base-content">Help & Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6" />

          {/* Logout Button */}
          <TouchableOpacity
            className="w-full py-3 rounded-lg bg-error"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={handleLogout}
          >
            <Text className="text-error-content text-center font-medium">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
