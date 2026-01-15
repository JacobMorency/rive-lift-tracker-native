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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "./lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setEmailEmpty(false);
    setPasswordEmpty(false);
    setErrorMessage("");

    let hasError = false;

    if (!email) {
      setEmailEmpty(true);
      hasError = true;
    }

    if (!password) {
      setPasswordEmpty(true);
      hasError = true;
    }

    // Stop form submission if fields are empty
    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL || "https://your-app.com"}/login`,
          },
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
      setErrorMessage(message);
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
      className="flex-1 justify-center items-center p-4 bg-white dark:bg-zinc-900"
    >
      <View className="w-full max-w-md p-6 gap-4">
        <Text className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
          {isRegisterMode ? "Create account" : "Sign in"}
        </Text>

        <View className="flex justify-center items-center my-2">
          <View className="bg-[#ff4b8c] dark:bg-[#ff6fa1] rounded-full h-20 w-20 flex items-center justify-center">
            <Ionicons name="barbell" size={32} color="#ffffff" />
          </View>
        </View>

        {errorMessage && (
          <Text className="text-center text-error italic text-sm">
            {errorMessage}
          </Text>
        )}

        <View>
          <Text className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
            Email
          </Text>
          <TextInput
            className={`border rounded-lg px-3 py-2 text-zinc-900 dark:text-white bg-gray-50 dark:bg-zinc-800 ${
              emailEmpty ? "border-error" : "border-gray-200 dark:border-zinc-700"
            }`}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailEmpty(false);
              setErrorMessage("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailEmpty && (
            <Text className="text-error italic text-sm">Email is required</Text>
          )}
        </View>

        <View>
          <Text className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
            Password
          </Text>
          <TextInput
            className={`border rounded-lg px-3 py-2 text-zinc-900 dark:text-white bg-gray-50 dark:bg-zinc-800 ${
              passwordEmpty ? "border-error" : "border-gray-200 dark:border-zinc-700"
            }`}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordEmpty(false);
              setErrorMessage("");
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {passwordEmpty && (
            <Text className="text-error italic text-sm">
              Password is required
            </Text>
          )}
        </View>

        {!isRegisterMode && (
          <TouchableOpacity
            onPress={handleForgotPassword}
            className="self-end mb-2"
          >
            <Text className="text-[#ff4b8c] dark:text-[#ff6fa1] text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className={`w-full py-3 mt-2 rounded-lg ${loading ? "bg-gray-100 dark:bg-zinc-700" : "bg-[#ff4b8c] dark:bg-[#ff6fa1]"}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text
            className={`text-center font-medium ${loading ? "text-gray-500 dark:text-gray-400" : "text-white"}`}
          >
            {loading
              ? "Loading..."
              : isRegisterMode
                ? "Create account"
                : "Login"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
          <Text className="mx-4 text-gray-500 dark:text-gray-400">OR</Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
        </View>

        <TouchableOpacity
          className="w-full py-3 rounded-lg border border-gray-200 dark:border-zinc-700"
          onPress={() => setIsRegisterMode(!isRegisterMode)}
        >
          <Text className="text-zinc-900 dark:text-white text-center font-medium">
            {isRegisterMode ? "Have an account? Sign in" : "Create an account"}
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          Google and Apple sign-in are coming soon!
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
