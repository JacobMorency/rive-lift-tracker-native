import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "./context/authcontext";
import { supabase } from "./lib/supabaseClient";

export default function WorkoutsPage() {
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
      console.error("Logout error:", error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4 bg-white">
      <View className="w-full max-w-md space-y-6">
        <View className="items-center">
          <View className="bg-green-500 rounded-full h-20 w-20 flex items-center justify-center mb-4">
            <Text className="text-4xl">💪</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">Workouts</Text>
          {userData && (
            <Text className="text-lg text-gray-600 mt-2">
              Welcome, {userData.first_name} {userData.last_name}!
            </Text>
          )}
          {user && (
            <Text className="text-sm text-gray-500 mt-1">{user.email}</Text>
          )}
        </View>

        <View className="space-y-4">
          <Text className="text-center text-gray-600">
            This is the workouts page. The full workout features will be
            migrated here soon!
          </Text>

          <TouchableOpacity
            className="w-full py-3 rounded-lg bg-red-500"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
