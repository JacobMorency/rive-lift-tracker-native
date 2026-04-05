import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

export type SessionTopBarSecondaryAction = {
  label: string;
  onPress: () => void;
  /** Muted red text (e.g. cancel session). */
  destructive?: boolean;
};

type SessionDetailTopBarProps = {
  onBack: () => void;
  secondaryAction?: SessionTopBarSecondaryAction | null;
};

export default function SessionDetailTopBar({
  onBack,
  secondaryAction,
}: SessionDetailTopBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className="bg-chrome dark:bg-chrome-dark border-b border-border dark:border-border-dark px-4"
      style={{ paddingTop: insets.top, paddingBottom: 8 }}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Back to sessions"
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-80"
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
            Workout Session
          </AppText>
        </View>

        {secondaryAction ? (
          <TouchableOpacity
            onPress={secondaryAction.onPress}
            accessibilityLabel={secondaryAction.label}
            className="py-2 pl-2 shrink-0 active:opacity-80"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText
              variant="body"
              tone={secondaryAction.destructive ? "default" : "primary"}
              className={`font-semibold normal-case text-sm max-w-[140px] ${
                secondaryAction.destructive
                  ? "text-red-500 dark:text-red-400"
                  : ""
              }`}
              numberOfLines={2}
            >
              {secondaryAction.label}
            </AppText>
          </TouchableOpacity>
        ) : (
          <View className="w-10 shrink-0" />
        )}
      </View>
    </View>
  );
}
