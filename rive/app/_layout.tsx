// app/_layout.tsx

import { Slot } from "expo-router";
import "../app/globals.css";
import Toast from "react-native-toast-message";

import { AuthProvider } from "../hooks/useAuth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <>
        <Slot />
        <Toast />
      </>
    </AuthProvider>
  );
}
