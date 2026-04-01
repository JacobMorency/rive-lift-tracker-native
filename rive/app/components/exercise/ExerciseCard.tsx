import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "./types";
import AppCard from "../ui/AppCard";
import AppText from "../ui/AppText";

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
    <AppCard
      className={`${
        isSelected ? "border border-primary dark:border-primary" : ""
      }`}
      onPress={onToggle}
    >
      <View className="flex-row items-center gap-4">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mt-1">
            {exercise.primaryMuscleGroup && (
              <AppText
                variant="caption"
                className={`font-bold  ${isSelected ? "text-primary dark:text-primary" : "text-textMuted dark:text-textMuted-dark"}`}
              >
                {exercise.primaryMuscleGroup}
              </AppText>
            )}
          </View>
          <AppText variant="body" className="font-bold">
            {formatExerciseName(exercise.name)}
          </AppText>
        </View>
        <View className="p-1 rounded-full items-center justify-center">
          <Ionicons
            name={isSelected ? "checkmark-circle" : "add-circle-outline"}
            size={20}
            color={isSelected ? "#ff4b8c" : "#6b7280"}
          />
        </View>
      </View>
    </AppCard>
  );
}
