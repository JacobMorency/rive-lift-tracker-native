import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./context/authcontext";
import { supabase } from "./lib/supabaseClient";

export default function CompleteProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, refreshUserData } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please fill in both first and last name");
      return;
    }

    if (!user) {
      Alert.alert("Error", "No user found");
      return;
    }

    setLoading(true);

    try {
      console.log("👤 Creating user profile...");

      const { error } = await supabase.from("users").upsert({
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: user.email,
      });

      if (error) throw error;

      console.log("✅ Profile created successfully");

      // Refresh user data
      await refreshUserData();

      // Navigate to workouts page
      router.replace("/workouts");
    } catch (error: any) {
      console.error("❌ Profile creation failed:", error);
      Alert.alert("Error", "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center items-center p-4 bg-white"
    >
      <View className="w-full max-w-md p-6 space-y-6">
        <View className="items-center">
          <View className="bg-blue-500 rounded-full h-20 w-20 flex items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </Text>
          <Text className="text-center text-gray-600 mt-2">
            Please provide your first and last name to continue
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              First Name
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Last Name
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            className={`w-full py-3 rounded-lg ${loading ? "bg-gray-400" : "bg-blue-500"}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-white text-center font-medium">
              {loading ? "Creating Profile..." : "Complete Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
