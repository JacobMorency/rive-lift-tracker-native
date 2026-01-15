import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps = {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
};

export default function Header({
  title,
  subtitle,
  rightComponent,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-gray-50 dark:bg-zinc-800 px-4 border-b border-gray-200 dark:border-zinc-700"
      style={{ paddingTop: insets.top + 16, paddingBottom: 20 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</Text>
          {subtitle && <Text className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</Text>}
        </View>
        {rightComponent && <View className="ml-4">{rightComponent}</View>}
      </View>
    </View>
  );
}
