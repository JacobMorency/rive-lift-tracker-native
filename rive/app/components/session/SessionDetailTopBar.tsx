import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

type SessionDetailTopBarProps = {
  onBack: () => void;
  onFinish: () => void;
  finishDisabled: boolean;
  onCancelSession: () => void;
};

export default function SessionDetailTopBar({
  onBack,
  onFinish,
  finishDisabled,
  onCancelSession,
}: SessionDetailTopBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className="bg-chrome dark:bg-chrome-dark border-b border-border dark:border-border-dark px-4"
      style={{ paddingTop: insets.top, paddingBottom: 8 }}
    >
      <View className="flex-row items-center justify-between">
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

        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            onPress={onCancelSession}
            accessibilityLabel="Cancel session"
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-80"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={finishDisabled ? undefined : onFinish}
            disabled={finishDisabled}
            accessibilityLabel="Finish session"
            accessibilityState={{ disabled: finishDisabled }}
            className="py-2 pl-2 pr-1 active:opacity-80"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText
              variant="body"
              tone="primary"
              className={`font-bold tracking-tight normal-case ${finishDisabled ? "opacity-40" : ""}`}
            >
              Finish
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
