import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

type SessionExerciseCardProps = {
  formattedName: string;
  subtitle: string;
  setCount: number;
  isCompleted: boolean;
  hasStarted: boolean;
  onPress: () => void;
  onRemove: () => void;
};

export default function SessionExerciseCard({
  formattedName,
  subtitle,
  setCount,
  isCompleted: _isCompleted,
  hasStarted: _hasStarted,
  onPress,
  onRemove,
}: SessionExerciseCardProps) {
  const isDark = useColorScheme() === "dark";
  const primary = isDark ? "#ff6fa1" : "#ff4b8c";
  const chevron = isDark ? "#71717a" : "#a1a1aa";

  const subtitleText =
    setCount > 0
      ? `${subtitle} · ${setCount} set${setCount !== 1 ? "s" : ""}`
      : subtitle;

  return (
    <View className="flex-row items-center rounded-ds-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
      <TouchableOpacity
        onPress={onPress}
        className="flex-1 flex-row items-center gap-3 px-4 py-4"
      >
        <Ionicons name="barbell-outline" size={20} color={primary} />
        <View className="min-w-0 flex-1">
          <AppText variant="body" className="font-semibold">
            {formattedName}
          </AppText>
          <AppText variant="caption" tone="muted" className="text-xs">
            {subtitleText}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={chevron} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRemove} className="px-3 ">
        <Ionicons name="trash-outline" size={18} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
}
