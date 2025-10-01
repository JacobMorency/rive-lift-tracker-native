import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

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

  return (
    <TouchableOpacity
      className={`p-4 rounded-lg shadow-sm ${
        isPrimary ? "bg-blue-500" : "bg-white border border-gray-200"
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className={`text-lg font-semibold ${
              isPrimary ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </Text>
          <Text
            className={`text-sm mt-1 ${
              isPrimary ? "text-blue-100" : "text-gray-600"
            }`}
          >
            {description}
          </Text>
        </View>
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isPrimary ? "bg-blue-400" : "bg-blue-100"
          }`}
        >
          <Text className="text-2xl">{icon}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default WorkoutCard;
