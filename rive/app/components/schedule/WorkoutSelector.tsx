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
      <Text className="text-base-content font-medium mb-2">
        Select Workout Template
      </Text>
      {templates.map((template) => (
        <TouchableOpacity
          key={template.id}
          className={`p-3 rounded-lg border mb-2 ${
            selectedWorkoutId === template.id
              ? "bg-primary/10 border-primary"
              : "bg-base-200 border-base-300"
          }`}
          onPress={() => onSelectWorkout(template.id)}
        >
          <Text className="text-base-content font-medium">{template.name}</Text>
          {template.description && (
            <Text className="text-muted text-sm mt-1">
              {template.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

