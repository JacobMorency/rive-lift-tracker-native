import { Stack } from "expo-router";
import "react-native-url-polyfill/auto";
import "../global.css";
import { AuthProvider } from "./context/authcontext";
import AuthGuard from "../app/components/authguard";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGuard>
    </AuthProvider>
  );
}
