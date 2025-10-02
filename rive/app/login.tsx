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
      className="flex-1 justify-center items-center p-4 bg-base-100"
    >
      <View className="w-full max-w-md p-6 space-y-4">
        <Text className="text-2xl font-bold text-center text-base-content">
          {isRegisterMode ? "Create account" : "Sign in"}
        </Text>

        <View className="flex justify-center">
          <View className="bg-primary rounded-full h-20 w-20 flex items-center justify-center">
            <Ionicons name="barbell" size={32} color="#ffffff" />
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-base-content mb-1">
            Email
          </Text>
          <TextInput
            className="border border-base-300 rounded-lg px-3 py-2 text-base-content bg-base-200"
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-base-content mb-1">
            Password
          </Text>
          <TextInput
            className="border border-base-300 rounded-lg px-3 py-2 text-base-content bg-base-200"
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {!isRegisterMode && (
          <TouchableOpacity onPress={handleForgotPassword} className="self-end">
            <Text className="text-primary text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className={`w-full py-3 rounded-lg ${loading ? "bg-base-300" : "bg-primary"}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text
            className={`text-center font-medium ${loading ? "text-muted" : "text-primary-content"}`}
          >
            {loading
              ? "Loading..."
              : isRegisterMode
                ? "Create account"
                : "Login"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-base-300" />
          <Text className="mx-4 text-muted">OR</Text>
          <View className="flex-1 h-px bg-base-300" />
        </View>

        <TouchableOpacity
          className="w-full py-3 rounded-lg border border-base-300"
          onPress={() => setIsRegisterMode(!isRegisterMode)}
        >
          <Text className="text-base-content text-center font-medium">
            {isRegisterMode ? "Have an account? Sign in" : "Create an account"}
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-muted">
          Google and Apple sign-in are coming soon!
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
