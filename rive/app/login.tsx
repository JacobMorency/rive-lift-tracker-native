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
import { supabase } from "./lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert("Success", "Check your email to confirm your account.");
        setIsRegisterMode(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log("🔑 Login successful!");
        console.log("📋 Session details:", {
          user: data.user?.email,
          expires: data.session?.expires_at,
          access_token: data.session?.access_token ? "exists" : "missing",
        });

        if (data.user && data.session) {
          router.replace("/");
        }
      }
    } catch (error: any) {
      const message = isRegisterMode
        ? "Sign up failed. Please try again."
        : "Login failed. Invalid email or password.";
      Alert.alert("Error", message);
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Coming Soon",
      "Forgot password functionality will be available soon!"
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center items-center p-4 bg-white"
    >
      <View className="w-full max-w-md p-6 space-y-4">
        <Text className="text-2xl font-bold text-center text-gray-900">
          {isRegisterMode ? "Create account" : "Sign in"}
        </Text>

        <View className="flex justify-center">
          <View className="bg-blue-500 rounded-full h-20 w-20 flex items-center justify-center">
            <Text className="text-4xl">💪</Text>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Password
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {!isRegisterMode && (
          <TouchableOpacity onPress={handleForgotPassword} className="self-end">
            <Text className="text-blue-500 text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className={`w-full py-3 rounded-lg ${loading ? "bg-gray-400" : "bg-blue-500"}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-center font-medium">
            {loading
              ? "Loading..."
              : isRegisterMode
                ? "Create account"
                : "Login"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity
          className="w-full py-3 rounded-lg border border-gray-300"
          onPress={() => setIsRegisterMode(!isRegisterMode)}
        >
          <Text className="text-gray-700 text-center font-medium">
            {isRegisterMode ? "Have an account? Sign in" : "Create an account"}
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500">
          Google and Apple sign-in are coming soon!
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
