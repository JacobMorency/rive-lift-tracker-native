import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "./ui/AppText";

type HeaderProps = {
  /** e.g. date range control on Stats */
  rightComponent?: React.ReactNode;
};

/** Minimal top bar: RIVE + optional trailing action. Page titles live in screen content. */
export default function Header({ rightComponent }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background px-4 dark:bg-chrome-dark"
      style={{ paddingTop: insets.top, paddingBottom: 10 }}
    >
      <View className="min-h-[36px] flex-row items-center justify-between">
        <AppText variant="subheader" tone="primary" className="font-extrabold">
          RIVE
        </AppText>
        {rightComponent ? (
          <View className="ml-3 flex-shrink-0">{rightComponent}</View>
        ) : null}
      </View>
    </View>
  );
}
