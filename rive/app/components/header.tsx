import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "./ui/AppText";

type HeaderProps = {
  title: string;
  rightComponent?: React.ReactNode;
};

export default function Header({ title, rightComponent }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background dark:bg-chrome-dark px-4 border-b border-border dark:border-border-dark shadow-sm dark:shadow-lg"
      style={{ paddingTop: insets.top, paddingBottom: 8 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <AppText variant="subheader" tone="default">
            {title}
          </AppText>
        </View>
        {rightComponent && <View className="ml-4">{rightComponent}</View>}
      </View>
    </View>
  );
}
