import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "./types";

type ExerciseListItemProps = {
  exercise: Exercise;
  index: number;
  onRemove: (exerciseId: number, exerciseName: string) => void;
};

const formatExerciseName = (name: string) => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ExerciseListItem({
  exercise,
  index,
  onRemove,
}: ExerciseListItemProps) {
  return (
    <View
      className="bg-base-200 rounded-xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 bg-primary/20 rounded-xl items-center justify-center">
          <Ionicons name="barbell-outline" size={20} color="#ff4b8c" />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-base-content">
            {formatExerciseName(exercise.name)}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="bg-base-300 px-2 py-1 rounded-full">
              <Text className="text-xs text-muted">{exercise.category}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="w-10 h-10 bg-error/20 rounded-xl items-center justify-center"
          onPress={() => onRemove(exercise.id, exercise.name)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
