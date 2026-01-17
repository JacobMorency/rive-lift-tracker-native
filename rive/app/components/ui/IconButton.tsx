import React from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
  className?: string;
  style?: ViewStyle;
};

export default function IconButton({
  icon,
  onPress,
  variant = "secondary",
  size = "medium",
  className = "",
  style,
}: IconButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const sizeMap = {
    small: { container: "w-8 h-8", icon: 16 },
    medium: { container: "w-11 h-11", icon: 20 },
    large: { container: "w-12 h-12", icon: 24 },
  };

  const variantClasses = {
    primary: isDark ? "bg-[#ff6fa1]" : "bg-[#ff4b8c]",
    secondary: isDark ? "bg-zinc-700" : "bg-gray-100",
    ghost: "bg-transparent",
  };

  const iconColors = {
    primary: "#ffffff",
    secondary: isDark ? "#ffffff" : "#1f2937",
    ghost: isDark ? "#ff6fa1" : "#ff4b8c",
  };

  const { container, icon: iconSize } = sizeMap[size];
  const combinedClassName =
    `${container} ${variantClasses[variant]} rounded-lg items-center justify-center ${className}`.trim();

  return (
    <TouchableOpacity
      className={combinedClassName}
      onPress={onPress}
      activeOpacity={0.7}
      style={style}
    >
      <Ionicons name={icon} size={iconSize} color={iconColors[variant]} />
    </TouchableOpacity>
  );
}
