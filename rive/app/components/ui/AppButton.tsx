import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "./AppText";

type AppButtonTone = "primary" | "neutral";
type AppButtonSize = "sm" | "md" | "lg" | "icon";

type AppButtonProps = {
  label?: string;
  tone?: AppButtonTone;
  size?: AppButtonSize;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  onPress?: () => void;
  className?: string;
};

const toneClasses: Record<AppButtonTone, string> = {
  primary: "bg-primary dark:bg-primary-dark",
  neutral: "bg-surfaceAlt dark:bg-surfaceAlt-dark",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "px-3 py-2 rounded-ds-control",
  md: "px-4 py-3 rounded-ds-control",
  lg: "px-5 py-4 rounded-ds-control",
  icon: "w-14 h-14 rounded-full items-center justify-center",
};

export default function AppButton({
  label,
  tone = "neutral",
  size = "md",
  icon,
  fullWidth = false,
  onPress,
  className = "",
}: AppButtonProps) {
  const resolvedClassName =
    `${toneClasses[tone]} ${sizeClasses[size]} ${
      fullWidth ? "w-full" : ""
    } flex-row items-center justify-center ${className}`.trim();

  return (
    <TouchableOpacity
      className={resolvedClassName}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon ? (
        <View className={label ? "mr-2" : ""}>{icon}</View>
      ) : null}
      {label ? (
        <AppText
          variant="body"
          tone={tone === "primary" ? "inverse" : "default"}
          className="font-semibold"
        >
          {label}
        </AppText>
      ) : null}
    </TouchableOpacity>
  );
}

