import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WorkoutTemplate } from "./types";

type WorkoutSelectorProps = {
  templates: WorkoutTemplate[];
  selectedWorkoutId: string;
  onSelectWorkout: (id: string) => void;
};

export default function WorkoutSelector({
  templates,
  selectedWorkoutId,
  onSelectWorkout,
}: WorkoutSelectorProps) {
  return (
    <View className="mb-6">
      <Text className="text-zinc-900 dark:text-white font-medium mb-2">
        Select Workout Template
      </Text>
      {templates.map((template) => (
        <TouchableOpacity
          key={template.id}
          className={`p-3 rounded-lg border mb-2 ${
            selectedWorkoutId === template.id
              ? "bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 border-primary"
              : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
          }`}
          onPress={() => onSelectWorkout(template.id)}
        >
          <Text className="text-zinc-900 dark:text-white font-medium">{template.name}</Text>
          {template.description && (
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {template.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

