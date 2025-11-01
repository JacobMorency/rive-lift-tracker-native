import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FilterButtonProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: string;
  iconSize?: number;
  flex?: boolean;
};

export default function FilterButton({
  label,
  isSelected,
  onPress,
  icon,
  iconSize = 18,
  flex = false,
}: FilterButtonProps) {
  return (
    <TouchableOpacity
      className={`px-4 py-3 rounded-xl flex-row items-center ${
        flex ? "flex-1 justify-center" : ""
      } gap-2 ${isSelected ? "bg-primary" : "bg-base-300"}`}
      onPress={onPress}
      style={{
        shadowColor: isSelected ? "#ff4b8c" : "transparent",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
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
          isSelected ? "text-primary-content" : "text-base-content"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

