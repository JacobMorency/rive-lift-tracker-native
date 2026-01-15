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
      className={`p-4 rounded-lg ${isPrimary ? "" : "bg-gray-100 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700"}`}
      style={{
        backgroundColor: isPrimary ? "#ff4b8c" : undefined,
        borderWidth: isPrimary ? 0 : undefined,
        borderColor: isPrimary ? "transparent" : undefined,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className="text-lg font-semibold"
            style={{
              color: isPrimary ? "#ffffff" : undefined,
            }}
            className={isPrimary ? "text-white" : "text-zinc-900 dark:text-white"}
          >
            {title}
          </Text>
          <Text
            className={`text-sm mt-1 ${isPrimary ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}
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
