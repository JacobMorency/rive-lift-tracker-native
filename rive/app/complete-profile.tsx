import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "./context/authcontext";
import { supabase } from "./lib/supabaseClient";

export default function CompleteProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (userData && userData.first_name && userData.last_name) {
      router.push("/(tabs)/workouts");
      return;
    }

    if (userData) {
      setFirstName(userData.first_name || "");
      setLastName(userData.last_name || "");
    }
  }, [user, userData, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      console.log("👤 Creating user profile...");

      const { error } = await supabase.from("users").upsert(
        {
          id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      console.log("✅ Profile created successfully");

      // Refresh user data
      await refreshUserData?.();

      // Navigate to tabs
      router.replace("/(tabs)/workouts");
    } catch (error: any) {
      console.error("❌ Profile creation failed:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center items-center p-4 bg-base-200"
    >
      <View className="w-full max-w-md">
        <View className="bg-base-100 rounded-lg shadow-lg p-6 space-y-6">
          <View className="text-center">
            <View className="bg-primary rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Ionicons name="person" size={32} color="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-base-content">
              Complete Your Profile
            </Text>
            <Text className="text-base-content/60 mt-2">
              Welcome! Please complete your profile to get started.
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-base-content mb-1">
                First Name
              </Text>
              <TextInput
                className={`border rounded-lg px-3 py-2 text-base-content bg-base-200 ${
                  errors.firstName ? "border-error" : "border-base-300"
                }`}
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) setErrors({ ...errors, firstName: "" });
                }}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
              />
              {errors.firstName && (
                <Text className="text-error text-sm mt-1">
                  {errors.firstName}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-base-content mb-1">
                Last Name
              </Text>
              <TextInput
                className={`border rounded-lg px-3 py-2 text-base-content bg-base-200 ${
                  errors.lastName ? "border-error" : "border-base-300"
                }`}
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) setErrors({ ...errors, lastName: "" });
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.lastName && (
                <Text className="text-error text-sm mt-1">
                  {errors.lastName}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className={`w-full py-3 my-2 rounded-lg flex-row items-center justify-center ${
                loading ? "bg-base-300" : "bg-primary"
              }`}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Text className="text-muted text-center font-medium">
                  Creating Profile...
                </Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                  <Text className="text-primary-content text-center font-medium ml-2">
                    Complete Profile
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="bg-info/10 border border-info/20 rounded-lg p-4">
            <View className="flex-row items-start">
              <View className="bg-info/20 rounded-full p-1 mt-0.5 mr-3">
                <Ionicons name="information-circle" size={16} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-info mb-1">
                  Profile Information
                </Text>
                <Text className="text-sm text-base-content/70">
                  This information will be used to personalize your experience
                  and help you track your fitness journey.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
