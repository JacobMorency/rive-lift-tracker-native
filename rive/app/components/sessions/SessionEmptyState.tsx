import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

export default function SessionEmptyState() {
  return (
    <View className="items-center py-12 px-2">
      <View className="w-20 h-20 rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark items-center justify-center mb-4">
        <Ionicons name="fitness-outline" size={40} color="#9ca3af" />
      </View>
      <AppText variant="subheader" className="text-center mb-2">
        No sessions yet
      </AppText>
      <AppText
        variant="caption"
        tone="muted"
        className="text-center max-w-xs mb-6"
      >
        Start a workout session to see it listed here.
      </AppText>
      <View className="flex-row items-center gap-2">
        <Ionicons name="add" size={16} color="#ff4b8c" />
        <AppText variant="caption" tone="primary">
          Tap + to start
        </AppText>
      </View>
    </View>
  );
}
