import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import supabase from "../lib/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

type LoginFormProps = {
  onLoginSuccess: (user: User | null, session: Session | null) => void;
  handleForgotPassword: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  handleForgotPassword,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [emailEmpty, setEmailEmpty] = useState<boolean>(false);
  const [passwordEmpty, setPasswordEmpty] = useState<boolean>(false);
  const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    setEmailEmpty(false);
    setPasswordEmpty(false);

    let hasError = false;

    if (!email) {
      setEmailEmpty(true);
      hasError = true;
    }

    if (!password) {
      setPasswordEmpty(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

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
          email: email,
          password: password,
        });

        if (error) {
          throw error;
        }
        onLoginSuccess(data.user, data.session);
      }
    } catch (error) {
      const message = isRegisterMode
        ? "Sign up failed. Please try again."
        : "Login failed. Invalid email or password.";
      Alert.alert("Error", message);
      if (process.env.NODE_ENV === "development") {
        console.error("Auth error:", error);
      }
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <View className="w-full max-w-md p-6 space-y-3">
        <Text className="text-2xl font-bold text-center">
          {isRegisterMode ? "Create account" : "Sign in"}
        </Text>
        <View className="flex justify-center">
          <View className="bg-blue-500 shrink-0 rounded-full h-20 w-20 flex items-center justify-center">
            <Text className="text-5xl">{isPasswordActive ? "🙈" : "💪"}</Text>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium mb-1">Email</Text>
          <TextInput
            className={`border rounded-lg p-3 ${
              emailEmpty ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailEmpty(false);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailEmpty && (
            <Text className="text-red-500 italic text-sm">
              Email is required
            </Text>
          )}
        </View>

        <View>
          <Text className="text-sm font-medium mb-1">Password</Text>
          <TextInput
            className={`border rounded-lg p-3 ${
              passwordEmpty ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordEmpty(false);
              setIsPasswordActive(true);
            }}
            onBlur={() => setIsPasswordActive(false)}
            secureTextEntry
          />
          {passwordEmpty && (
            <Text className="text-red-500 italic text-sm">
              Password is required
            </Text>
          )}
        </View>

        {!isRegisterMode && (
          <View className="items-end">
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-blue-500 text-sm">Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-3 items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-medium">
            {isRegisterMode ? "Create account" : "Login"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 items-center mb-2"
          onPress={() => setIsRegisterMode((v) => !v)}
        >
          <Text className="text-gray-700">
            {isRegisterMode ? "Have an account? Sign in" : "Create an account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="border border-gray-300 rounded-lg p-3 items-center mb-2">
          <Text className="text-gray-700">Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="border border-gray-300 rounded-lg p-3 items-center">
          <Text className="text-gray-700">Sign in with Apple</Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500">
          Google and Apple sign-in are coming soon!
        </Text>
      </View>
    </View>
  );
};

export default LoginForm;
