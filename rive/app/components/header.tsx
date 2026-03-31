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
      className="bg-background dark:bg-chrome-dark px-4 border-b border-border dark:border-border-dark shadow-sm dark:shadow-lg"
      style={{ paddingTop: insets.top, paddingBottom: 16 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-text dark:text-text-dark">
            {title}
          </Text>
        </View>
        {rightComponent && <View className="ml-4">{rightComponent}</View>}
      </View>
    </View>
  );
}
