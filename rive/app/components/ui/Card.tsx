import React from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";
import { useColorScheme } from "react-native";

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
  className?: string;
  style?: ViewStyle;
};

export default function Card({
  children,
  onPress,
  variant = "default",
  className = "",
  style,
}: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const baseClasses = "rounded-xl p-4";

  const variantClasses = {
    default: isDark ? "bg-zinc-800" : "bg-gray-50",
    elevated: isDark ? "bg-zinc-800" : "bg-white",
    outlined: isDark
      ? "bg-zinc-800 border border-zinc-700"
      : "bg-white border border-gray-200",
  };

  const shadowStyle =
    variant === "elevated"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
      : variant === "default"
        ? {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }
        : {};

  const combinedClassName =
    `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  if (onPress) {
    return (
      <TouchableOpacity
        className={combinedClassName}
        onPress={onPress}
        activeOpacity={0.7}
        style={[shadowStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedClassName} style={[shadowStyle, style]}>
      {children}
    </View>
  );
}
