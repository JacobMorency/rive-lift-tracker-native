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

    // Authenticated → redirect away from login
    if (currentRoute === "login") {
      router.replace("/");
      return;
    }
  }, [user, loading, router, segments]);

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
