import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";

/** Use with ScrollView contentContainerStyle.paddingBottom: this + insets.bottom when the sticky footer is visible. */
export const STICKY_BOTTOM_PRIMARY_SCROLL_PADDING = 78;

type StickyBottomPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** When false, renders nothing (e.g. hide while a bottom sheet or pad is open). */
  visible?: boolean;
  /** Leading icon; default checkmark (e.g. use add for create actions). */
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
};

export default function StickyBottomPrimaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  visible = true,
  iconName = "checkmark",
}: StickyBottomPrimaryButtonProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconMuted = isDark ? "#a3a3a3" : "#737373";
  const glowColor = isDark ? "#ff6fa1" : "#ff4b8c";

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 bg-transparent px-4 pt-4"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        className={`w-full min-h-[52px] py-4 rounded-2xl flex-row items-center justify-center gap-2.5 ${
          disabled
            ? "bg-surfaceAlt dark:bg-surfaceAlt-dark"
            : "bg-primary dark:bg-primary-dark active:opacity-90"
        }`}
        style={
          disabled
            ? undefined
            : {
                shadowColor: glowColor,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 22,
                elevation: 16,
              }
        }
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={disabled ? iconMuted : "#ffffff"}
        />
        <AppText
          variant="body"
          tone={disabled ? "muted" : "inverse"}
          className="font-bold uppercase tracking-wider text-sm"
        >
          {label}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
