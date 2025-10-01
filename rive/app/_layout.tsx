import { Stack } from "expo-router";
import "react-native-url-polyfill/auto";
import "../global.css";
import { AuthProvider } from "./context/authcontext";
import AuthGuard from "./components/authguard";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="complete-profile"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="workouts" options={{ headerShown: false }} />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
