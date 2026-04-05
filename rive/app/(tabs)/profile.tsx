import React from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/header";
import AppText from "../components/ui/AppText";
import AppCard from "../components/ui/AppCard";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Error", "Failed to logout");
        console.error("Logout error:", error);
        return;
      }

      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
      console.error("Logout error:", error);
    }
  };

  const displayName =
    userData?.first_name || userData?.last_name
      ? [userData.first_name, userData.last_name].filter(Boolean).join(" ")
      : null;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <Header />

      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <AppCard
          radius="large"
          className="border border-primary/10 dark:border-primary-dark/20"
        >
          <View className="items-center">
            <View className="relative mb-4">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-primary dark:bg-primary-dark">
                <Ionicons name="person" size={36} color="#ffffff" />
              </View>
              <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-surface dark:border-surface-dark bg-success">
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
            </View>

            {displayName ? (
              <AppText
                variant="subheader"
                tone="default"
                className="text-center"
              >
                {displayName}
              </AppText>
            ) : (
              <AppText variant="subheader" tone="muted" className="text-center">
                Your profile
              </AppText>
            )}

            {user?.email ? (
              <AppText
                variant="body"
                tone="muted"
                className="mt-2 text-center normal-case"
              >
                {user.email}
              </AppText>
            ) : null}

            <View className="mt-4 flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
              <AppText variant="caption" tone="muted" className="normal-case">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—"}
              </AppText>
            </View>
          </View>
        </AppCard>

        <View className="mt-8">
          <TouchableOpacity
            className="w-full flex-row items-center justify-center rounded-ds-control bg-error py-4 active:opacity-90"
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#ffffff" />
            <AppText variant="body" tone="inverse" className="ml-2 font-bold">
              Log out
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
