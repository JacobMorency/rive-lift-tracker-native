import { Stack } from "expo-router";
import "react-native-url-polyfill/auto";
import "../global.css";
import { AuthProvider } from "./context/authcontext";
import AuthGuard from "../app/components/authguard";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="complete-profile"
            options={{ headerShown: false }}
          />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
