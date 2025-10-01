import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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
        <View className="space-y-6">
          {/* User Info Card */}
          <View className="bg-base-300 rounded-lg p-6">
            <View className="items-center mb-4">
              <View className="bg-primary rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <Text className="text-4xl">👤</Text>
              </View>
              {userData && (
                <Text className="text-xl font-semibold text-base-content">
                  {userData.first_name} {userData.last_name}
                </Text>
              )}
              {user && <Text className="text-muted mt-1">{user.email}</Text>}
            </View>
          </View>

          {/* Stats Card */}
          <View className="bg-base-300 rounded-lg p-6">
            <Text className="text-lg font-semibold text-base-content mb-4">
              📊 Your Stats
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-muted">Total Workouts</Text>
                <Text className="font-medium text-base-content">0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Total Sessions</Text>
                <Text className="font-medium text-base-content">0</Text>
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

          {/* Settings Card */}
          <View className="bg-base-300 rounded-lg p-6">
            <Text className="text-lg font-semibold text-base-content mb-4">
              ⚙️ Settings
            </Text>
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

          {/* Logout Button */}
          <TouchableOpacity
            className="w-full py-3 rounded-lg bg-error"
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
