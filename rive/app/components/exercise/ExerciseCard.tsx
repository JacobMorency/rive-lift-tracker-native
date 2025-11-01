import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "./types";

type ExerciseCardProps = {
  exercise: Exercise;
  isSelected: boolean;
  onToggle: () => void;
};

const formatExerciseName = (name: string) => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ExerciseCard({
  exercise,
  isSelected,
  onToggle,
}: ExerciseCardProps) {
  return (
    <TouchableOpacity
      className={`rounded-xl p-4 ${
        isSelected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-base-200 border-2 border-transparent"
      }`}
      onPress={onToggle}
      style={{
        shadowColor: isSelected ? "#ff4b8c" : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isSelected ? 0.15 : 0.05,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isSelected ? "bg-primary" : "bg-base-300"
          }`}
        >
          <Ionicons
            name={isSelected ? "checkmark" : "add"}
            size={20}
            color={isSelected ? "#ffffff" : "#6b7280"}
          />
        </View>

        <View className="flex-1">
          <Text
            className={`text-lg font-semibold ${
              isSelected ? "text-primary" : "text-base-content"
            }`}
          >
            {formatExerciseName(exercise.name)}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="bg-base-300 px-2 py-1 rounded-full">
              <Text className="text-xs text-muted">{exercise.category}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

