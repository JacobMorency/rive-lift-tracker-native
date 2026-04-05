import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

type ScheduleScreenHeaderProps = {
  onBack: () => void;
  title?: string;
};

/** Stack chrome for the schedule screen; layout aligned with [`WorkoutHeader`](../workout/WorkoutHeader.tsx). */
export default function ScheduleScreenHeader({
  onBack,
  title = "Schedules",
}: ScheduleScreenHeaderProps) {
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
            onPress={onBack}
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
            {title}
          </AppText>
        </View>

        <View className="h-10 w-10 shrink-0" />
      </View>
    </View>
  );
}
