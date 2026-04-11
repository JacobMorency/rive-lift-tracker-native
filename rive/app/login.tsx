import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "./lib/supabaseClient";
import AppText from "./components/ui/AppText";
import AppButton from "./components/ui/AppButton";

const PLACEHOLDER_MUTED_LIGHT = "#6b7280";
const PLACEHOLDER_MUTED_DARK = "#a1a1aa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const placeholderColor = isDark
    ? PLACEHOLDER_MUTED_DARK
    : PLACEHOLDER_MUTED_LIGHT;

  const inputBaseClass =
    "rounded-ds-control border px-4 py-3.5 text-ds-body text-text dark:text-text-dark bg-surface dark:bg-surface-dark";

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
    } catch (error: unknown) {
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
      "Forgot password functionality will be available soon!",
    );
  };

  const emailBorderClass = emailEmpty
    ? "border-error"
    : "border-border dark:border-border-dark";

  const passwordBorderClass = passwordEmpty
    ? "border-error"
    : "border-border dark:border-border-dark";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background dark:bg-background-dark"
    >
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/15 dark:bg-primary-dark/20" />
        <View className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-primary/10 dark:bg-primary-dark/15" />
        <View className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-primary/5 dark:bg-primary-dark/10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md self-center">
          <View className="mb-10 items-center">
            <View
              className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary dark:bg-primary-dark"
              style={{
                shadowColor: isDark ? "#ff6fa1" : "#ff4b8c",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Ionicons name="barbell" size={34} color="#ffffff" />
            </View>
            <AppText
              variant="header"
              tone="primary"
              className="mb-2 text-center font-extrabold"
            >
              RIVE
            </AppText>
            <AppText variant="body" tone="muted" className="mb-6 text-center">
              Progress without the noise.
            </AppText>
            <AppText variant="subheader" tone="default" className="text-center">
              {isRegisterMode ? "Create your account" : "Welcome back"}
            </AppText>
          </View>

          {errorMessage ? (
            <AppText
              variant="body"
              className="mb-4 text-center italic text-error"
            >
              {errorMessage}
            </AppText>
          ) : null}

          <View className="gap-5">
            <View>
              <AppText variant="caption" tone="muted" className="mb-1.5 ml-1">
                Email
              </AppText>
              <TextInput
                className={`${inputBaseClass} ${emailBorderClass}`}
                placeholder="you@example.com"
                placeholderTextColor={placeholderColor}
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
              {emailEmpty ? (
                <AppText variant="body" className="mt-1 text-error italic">
                  Email is required
                </AppText>
              ) : null}
            </View>

            <View>
              <View className="mb-1.5 flex-row items-center justify-between px-1">
                <AppText variant="caption" tone="muted">
                  Password
                </AppText>
                {!isRegisterMode ? (
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <AppText
                      variant="caption"
                      tone="primary"
                      className="font-semibold normal-case"
                    >
                      Forgot?
                    </AppText>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TextInput
                className={`${inputBaseClass} ${passwordBorderClass}`}
                placeholder="••••••••"
                placeholderTextColor={placeholderColor}
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
              {passwordEmpty ? (
                <AppText variant="body" className="mt-1 text-error italic">
                  Password is required
                </AppText>
              ) : null}
            </View>

            <AppButton
              tone="primary"
              size="lg"
              fullWidth
              disabled={loading}
              onPress={handleSubmit}
              label={
                loading
                  ? "Loading..."
                  : isRegisterMode
                    ? "Create account"
                    : "Sign in"
              }
              accessibilityLabel={isRegisterMode ? "Create account" : "Sign in"}
            />

            <View className="flex-row items-center gap-3 py-2">
              <View className="h-px flex-1 bg-border/40 dark:bg-border-dark/50" />
              <AppText variant="caption" tone="muted">
                Or
              </AppText>
              <View className="h-px flex-1 bg-border/40 dark:bg-border-dark/50" />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                disabled
                activeOpacity={1}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-ds-card border border-border/60 bg-surfaceAlt py-4 dark:border-border-dark/60 dark:bg-surfaceAlt-dark"
              >
                <Ionicons
                  name="logo-google"
                  size={20}
                  color={isDark ? "#a1a1aa" : "#6b7280"}
                />
                <AppText variant="body" tone="muted" className="font-semibold">
                  Google
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                disabled
                activeOpacity={1}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-ds-card border border-border/60 bg-surfaceAlt py-4 dark:border-border-dark/60 dark:bg-surfaceAlt-dark"
              >
                <Ionicons
                  name="logo-apple"
                  size={22}
                  color={isDark ? "#a1a1aa" : "#6b7280"}
                />
                <AppText variant="body" tone="muted" className="font-semibold">
                  Apple
                </AppText>
              </TouchableOpacity>
            </View>

            <AppText
              variant="caption"
              tone="muted"
              className="text-center leading-5"
            >
              Google and Apple sign-in are not available yet.
            </AppText>

            <View className="mt-2 flex-row flex-wrap items-center justify-center">
              {isRegisterMode ? (
                <>
                  <AppText variant="body" tone="muted">
                    Already have an account?{" "}
                  </AppText>
                  <Pressable
                    onPress={() => {
                      setIsRegisterMode(false);
                      setErrorMessage("");
                    }}
                    accessibilityRole="link"
                    accessibilityLabel="Sign in"
                  >
                    <AppText
                      variant="body"
                      tone="primary"
                      className="font-bold"
                    >
                      Sign in
                    </AppText>
                  </Pressable>
                </>
              ) : (
                <>
                  <AppText variant="body" tone="muted">
                    New here?{" "}
                  </AppText>
                  <Pressable
                    onPress={() => {
                      setIsRegisterMode(true);
                      setErrorMessage("");
                    }}
                    accessibilityRole="link"
                    accessibilityLabel="Create an account"
                  >
                    <AppText
                      variant="body"
                      tone="primary"
                      className="font-bold"
                    >
                      Create an account
                    </AppText>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
