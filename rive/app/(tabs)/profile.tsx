import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/header";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
    <View className="flex-1 bg-white dark:bg-zinc-900">
      <Header
        title="Profile"
        subtitle={
          userData ? `Welcome back, ${userData.first_name}! 👋` : undefined
        }
      />

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View>
          {/* Enhanced User Info Card */}
          <View
            className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-6"
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
            <View className="items-center">
              <View className="bg-[#ff4b8c] dark:bg-[#ff6fa1] rounded-full h-24 w-24 flex items-center justify-center mb-4 relative">
                <Ionicons name="person" size={36} color="#ffffff" />
                <View className="absolute -bottom-1 -right-1 bg-success rounded-full h-8 w-8 items-center justify-center border-2 border-gray-100 dark:border-zinc-700">
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                </View>
              </View>
              {userData && (
                <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                  {userData.first_name} {userData.last_name}
                </Text>
              )}
              {user && <Text className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</Text>}
              <View className="flex-row items-center gap-2 mt-3">
                <Ionicons name="calendar" size={14} color="#9ca3af" />
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Member since{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6" />

          {/* Enhanced Settings Card */}
          <View
            className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-6"
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
              <Ionicons name="settings" size={24} color="#ff4b8c" />
              <Text className="text-xl font-bold text-zinc-900 dark:text-white ml-3">
                Settings
              </Text>
            </View>
            <View className="gap-2">
              <TouchableOpacity
                className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex-row items-center justify-between"
                onPress={() => router.push("/(tabs)/templates")}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 rounded-lg items-center justify-center">
                    <Ionicons name="barbell" size={20} color="#ff4b8c" />
                  </View>
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-medium">
                      Workout Templates
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Manage your workout templates
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 rounded-lg items-center justify-center">
                    <Ionicons name="person" size={20} color="#ff4b8c" />
                  </View>
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-medium">
                      Edit Profile
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Update your personal information
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-warning/20 rounded-lg items-center justify-center">
                    <Ionicons name="notifications" size={20} color="#f59e0b" />
                  </View>
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-medium">
                      Notifications
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Manage your notification preferences
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-success/20 rounded-lg items-center justify-center">
                    <Ionicons
                      name="shield-checkmark"
                      size={20}
                      color="#10b981"
                    />
                  </View>
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-medium">
                      Privacy & Security
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Control your data and privacy
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-info/20 rounded-lg items-center justify-center">
                    <Ionicons name="help-circle" size={20} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-medium">
                      Help & Support
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Get help and contact support
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6" />

          {/* Enhanced Logout Button */}
          <TouchableOpacity
            className="w-full py-4 rounded-xl bg-error flex-row items-center justify-center"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#ffffff" />
            <Text className="text-white text-center font-bold ml-2 text-lg">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
