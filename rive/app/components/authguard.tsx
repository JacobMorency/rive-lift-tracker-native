import React, { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../context/authcontext";
import { View, ActivityIndicator } from "react-native";

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0];

    // Not authenticated → go to login
    if (!user) {
      if (currentRoute !== "login") {
        router.replace("/login");
      }
      return;
    }

    // Authenticated but no user data yet → wait
    if (!userData) {
      return;
    }

    // Check if profile is incomplete
    const isProfileIncomplete = !userData.first_name || !userData.last_name;

    if (isProfileIncomplete) {
      if (currentRoute !== "complete-profile") {
        router.replace("/complete-profile");
      }
      return;
    }

    // Profile complete → redirect to workouts
    if (
      currentRoute === "login" ||
      currentRoute === "complete-profile" ||
      currentRoute === "index"
    ) {
      router.replace("/workouts");
      return;
    }
  }, [user, userData, loading, router, segments]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
