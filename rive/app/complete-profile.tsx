import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./context/authcontext";
import supabase from "./lib/supabaseClient";

const CompleteProfilePage = () => {
  const router = useRouter();
  const { user, userData, refreshUserData } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (userData && userData.first_name && userData.last_name) {
      router.replace("/workouts");
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
      const { error: upsertErr } = await supabase.from("users").upsert(
        {
          id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
        { onConflict: "id" }
      );
      if (upsertErr) throw upsertErr;

      await refreshUserData?.();
      Alert.alert("Success", "Profile completed successfully!");
      router.push("/workouts");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-4 bg-gray-100">
      <View className="w-full max-w-md">
        <View className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <View className="text-center">
            <View className="bg-blue-500 shrink-0 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              Complete Your Profile
            </Text>
            <Text className="text-gray-600 mt-2">
              Welcome! Please complete your profile to get started.
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                First Name
              </Text>
              <TextInput
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) setErrors({ ...errors, firstName: "" });
                }}
                className={`border rounded-lg p-3 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your first name"
                autoFocus
              />
              {errors.firstName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.firstName}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Last Name
              </Text>
              <TextInput
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) setErrors({ ...errors, lastName: "" });
                }}
                className={`border rounded-lg p-3 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.lastName}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className={`bg-blue-500 rounded-lg p-3 items-center ${
                loading ? "opacity-50" : ""
              }`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white font-medium">
                {loading ? "Completing..." : "Complete Profile"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row items-start gap-3">
              <View className="bg-blue-200 rounded-full p-1 mt-0.5">
                <Text className="text-blue-600 text-sm">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-blue-800 mb-1">
                  Profile Information
                </Text>
                <Text className="text-sm text-blue-700">
                  This information will be used to personalize your experience
                  and help you track your fitness journey.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CompleteProfilePage;
