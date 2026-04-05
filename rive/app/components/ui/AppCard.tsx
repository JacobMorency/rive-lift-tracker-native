import React from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";

type AppCardRadius = "large" | "control" | "tag";
type AppCardSurface = "default" | "alt";

type AppCardProps = {
  children: React.ReactNode;
  radius?: AppCardRadius;
  surface?: AppCardSurface;
  className?: string;
  style?: ViewStyle;
  onPress?: () => void;
};

const radiusClasses: Record<AppCardRadius, string> = {
  large: "rounded-ds-card",
  control: "rounded-ds-control",
  tag: "rounded-ds-tag",
};

const surfaceClasses: Record<AppCardSurface, string> = {
  default: "bg-surface dark:bg-surface-dark",
  alt: "bg-surfaceAlt dark:bg-surfaceAlt-dark",
};

export default function AppCard({
  children,
  radius = "large",
  surface = "default",
  className = "",
  style,
  onPress,
}: AppCardProps) {
  const resolvedClassName =
    `p-4 ${radiusClasses[radius]} ${surfaceClasses[surface]} ${className}`.trim();

  // If onPress exists return a clickable card
  if (onPress) {
    return (
      <TouchableOpacity
        className={resolvedClassName}
        style={style}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={resolvedClassName} style={style}>
      {children}
    </View>
  );
}
