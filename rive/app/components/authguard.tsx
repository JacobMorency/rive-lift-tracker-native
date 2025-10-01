import React, { useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../context/authcontext";

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Allow unauthenticated access to the login route
    if (!user) {
      if (pathname === "/login") return;
      router.replace("/login");
      return;
    }

    // If userData hasn't loaded yet, optimistically route to complete-profile to avoid spinner loops
    if (!userData) {
      if (pathname !== "/complete-profile") router.replace("/complete-profile");
      return;
    }

    // Authenticated but profile incomplete → go to complete-profile (avoid redirect loop)
    const isProfileIncomplete = !userData.first_name || !userData.last_name;
    if (isProfileIncomplete && pathname !== "/complete-profile") {
      router.replace("/complete-profile");
      return;
    }
  }, [user, userData, loading, router, pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Render children on the login route even when unauthenticated
  if (!user && pathname === "/login") return <>{children}</>;

  // Don't render children if user is not authenticated elsewhere
  if (!user) return null;

  return <>{children}</>;
};

export default AuthGuard;
