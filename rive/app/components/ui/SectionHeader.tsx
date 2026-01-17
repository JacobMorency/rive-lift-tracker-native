import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

type SectionHeaderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  badge?: number | string;
  action?: {
    label: string;
    onPress: () => void;
  };
  className?: string;
};

export default function SectionHeader({
  icon,
  title,
  badge,
  action,
  className = "",
}: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className={`flex-row items-center justify-between mb-4 ${className}`.trim()}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons
          name={icon}
          size={24}
          color={isDark ? "#ff6fa1" : "#ff4b8c"}
        />
        <Text className="text-xl font-bold text-zinc-900 dark:text-white">
          {title}
        </Text>
        {badge !== undefined && (
          <View className="bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 px-2 py-1 rounded-full">
            <Text className="text-xs font-semibold text-[#ff4b8c] dark:text-[#ff6fa1]">
              {badge}
            </Text>
          </View>
        )}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
          <Text className="text-sm font-medium text-[#ff4b8c] dark:text-[#ff6fa1]">
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
