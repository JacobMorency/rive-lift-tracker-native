import { Redirect } from "expo-router";
import { useAuth } from "./context/authcontext";

export default function Index() {
  const { user, userData, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return null;
  }

  // Not authenticated → go to login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Authenticated but no user data yet → wait
  if (!userData) {
    return null;
  }

  // Check if profile is incomplete
  const isProfileIncomplete = !userData.first_name || !userData.last_name;

  if (isProfileIncomplete) {
    return <Redirect href="/complete-profile" />;
  }

  // Profile complete → redirect to workouts tab
  return <Redirect href="/(tabs)/workouts" />;
}
