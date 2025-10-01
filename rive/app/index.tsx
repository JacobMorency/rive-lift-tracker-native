import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "./context/authcontext";
import { supabase } from "./lib/supabaseClient";

export default function HomePage() {
  const { user } = useAuth();

  console.log("🏠 HomePage: User logged in:", user?.email);

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
          <View className="bg-blue-500 rounded-full h-20 w-20 flex items-center justify-center mb-4">
            <Text className="text-4xl">💪</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">Welcome!</Text>
          <Text className="text-lg text-gray-600 mt-2">
            {user?.email || "User"}
          </Text>
        </View>

        <View className="space-y-4">
          <Text className="text-center text-gray-600">
            This is a temporary home page. The full app features will be
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
