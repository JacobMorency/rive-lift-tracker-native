import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type WorkoutCardProps = {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  variant?: "primary" | "default";
};

const WorkoutCard = ({
  title,
  description,
  icon,
  onPress,
  variant = "default",
}: WorkoutCardProps) => {
  const isPrimary = variant === "primary";

  const getIconComponent = () => {
    const iconColor = isPrimary ? "#ffffff" : "#ff4b8c";

    switch (icon) {
      case "➕":
        return (
          <Ionicons name="add-circle-outline" size={24} color={iconColor} />
        );
      case "🏋️":
        return <Ionicons name="barbell-outline" size={24} color={iconColor} />;
      case "▶️":
        return (
          <Ionicons name="play-circle-outline" size={24} color={iconColor} />
        );
      default:
        return <Text className="text-2xl">{icon}</Text>;
    }
  };

  return (
    <TouchableOpacity
      className="p-4 rounded-lg shadow-sm"
      style={{
        backgroundColor: isPrimary ? "#ff4b8c" : "#333333",
        borderWidth: isPrimary ? 0 : 1,
        borderColor: isPrimary ? "transparent" : "#333333",
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className="text-lg font-semibold"
            style={{
              color: isPrimary ? "#ffffff" : "#fefbee",
            }}
          >
            {title}
          </Text>
          <Text
            className="text-sm mt-1"
            style={{
              color: isPrimary ? "rgba(255, 255, 255, 0.8)" : "#9ca3af",
            }}
          >
            {description}
          </Text>
        </View>
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: isPrimary
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(255, 75, 140, 0.2)",
          }}
        >
          {getIconComponent()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default WorkoutCard;
