import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

type WorkoutHeaderProps = {
  onDeleteWorkout: () => void;
  onClose: () => void;
};

/** Matches [`SessionDetailTopBar`](session/SessionDetailTopBar.tsx) layout and styling. */
export default function WorkoutHeader({
  onDeleteWorkout,
  onClose,
}: WorkoutHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className="border-b border-border bg-chrome px-4 dark:border-border-dark dark:bg-chrome-dark"
      style={{ paddingTop: insets.top, paddingBottom: 8 }}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#f5f5f5" : "#111113"}
            />
          </TouchableOpacity>
          <AppText
            variant="subheader"
            tone="default"
            className="flex-1 font-bold tracking-tight"
            numberOfLines={1}
          >
            Workout Template
          </AppText>
        </View>

        <TouchableOpacity
          onPress={onDeleteWorkout}
          accessibilityLabel="Delete workout"
          className="shrink-0 py-2 pl-2 active:opacity-80"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText
            variant="body"
            tone="default"
            className="max-w-[140px] text-sm font-semibold normal-case text-red-500 dark:text-red-400"
            numberOfLines={2}
          >
            Delete
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
