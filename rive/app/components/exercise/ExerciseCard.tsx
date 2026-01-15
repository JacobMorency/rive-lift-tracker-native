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
          ? "bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 border-2 border-[#ff4b8c] dark:border-[#ff6fa1]"
          : "bg-gray-50 dark:bg-zinc-800 border-2 border-transparent"
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
            isSelected ? "bg-[#ff4b8c] dark:bg-[#ff6fa1]" : "bg-gray-100 dark:bg-zinc-700"
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
              isSelected ? "text-[#ff4b8c] dark:text-[#ff6fa1]" : "text-zinc-900 dark:text-white"
            }`}
          >
            {formatExerciseName(exercise.name)}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            {exercise.primaryMuscleGroup && (
              <View className="bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-500 dark:text-gray-400">{exercise.primaryMuscleGroup}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

