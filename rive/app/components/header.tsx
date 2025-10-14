import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-base-200 px-4 border-b border-base-300"
      style={{ paddingTop: insets.top + 16, paddingBottom: 20 }}
    >
      <View>
        <Text className="text-2xl font-bold text-base-content">{title}</Text>
        {subtitle && <Text className="text-muted mt-1">{subtitle}</Text>}
      </View>
    </View>
  );
}
