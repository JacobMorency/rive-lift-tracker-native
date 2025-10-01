import React from "react";
import { useRouter } from "expo-router";
import LoginForm from "./components/loginform";
import { User, Session } from "@supabase/supabase-js";

const LoginPage = () => {
  const router = useRouter();

  const handleLoginSuccess = (
    user: User | null,
    session: Session | null
  ): void => {
    if (user && session) {
      // Redirect to a guarded route; AuthGuard will handle profile gating
      router.replace("/workouts");
    }
    // TODO: Handle case where login fails or user is null
  };

  // TODO: Implement forgot password functionality
  const handleForgotPassword = (): void => {
    // For now, just show an alert
    alert("Forgot password functionality coming soon!");
  };

  return (
    <LoginForm
      onLoginSuccess={handleLoginSuccess}
      handleForgotPassword={handleForgotPassword}
    />
  );
};

export default LoginPage;
