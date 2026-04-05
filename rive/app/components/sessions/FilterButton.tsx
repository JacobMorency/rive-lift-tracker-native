import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FilterButtonProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: string;
  iconSize?: number;
  flex?: boolean;
  /** pill: chips (workout/status); sort: row halves; default: grid tiles */
  variant?: "default" | "pill" | "sort";
};

export default function FilterButton({
  label,
  isSelected,
  onPress,
  icon,
  iconSize = 18,
  flex = false,
  variant = "default",
}: FilterButtonProps) {
  const shape =
    variant === "pill"
      ? "rounded-full px-5 py-2.5"
      : variant === "sort"
        ? "rounded-ds-control py-4 min-h-[52px]"
        : "rounded-ds-control px-4 py-4";

  return (
    <TouchableOpacity
      className={`flex-row items-center ${shape} ${
        flex ? "flex-1 justify-center" : ""
      } gap-2 ${
        isSelected
          ? "bg-primary dark:bg-primary-dark"
          : "bg-surfaceAlt dark:bg-surfaceAlt-dark"
      }`}
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        shadowColor: isSelected ? "#ff4b8c" : "transparent",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isSelected ? 0.25 : 0,
        shadowRadius: 6,
        elevation: isSelected ? 4 : 0,
      }}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={iconSize}
          color={isSelected ? "#ffffff" : "#6b7280"}
        />
      )}
      <Text
        className={`text-sm font-medium ${
          isSelected
            ? "text-white"
            : "text-textMuted dark:text-textMuted-dark"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
