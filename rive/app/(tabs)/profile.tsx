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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white px-4 border-b border-gray-200"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-6">
          {/* User Info Card */}
          <View className="bg-white rounded-lg p-6 border border-gray-200">
            <View className="items-center mb-4">
              <View className="bg-blue-500 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <Text className="text-4xl">👤</Text>
              </View>
              {userData && (
                <Text className="text-xl font-semibold text-gray-900">
                  {userData.first_name} {userData.last_name}
                </Text>
              )}
              {user && <Text className="text-gray-600 mt-1">{user.email}</Text>}
            </View>
          </View>

          {/* Stats Card */}
          <View className="bg-white rounded-lg p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              📊 Your Stats
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Workouts</Text>
                <Text className="font-medium text-gray-900">0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Sessions</Text>
                <Text className="font-medium text-gray-900">0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Member Since</Text>
                <Text className="font-medium text-gray-900">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Settings Card */}
          <View className="bg-white rounded-lg p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              ⚙️ Settings
            </Text>
            <View className="space-y-3">
              <TouchableOpacity className="py-3 border-b border-gray-100">
                <Text className="text-gray-900">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3 border-b border-gray-100">
                <Text className="text-gray-900">Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3 border-b border-gray-100">
                <Text className="text-gray-900">Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3">
                <Text className="text-gray-900">Help & Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="w-full py-3 rounded-lg bg-red-500"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
