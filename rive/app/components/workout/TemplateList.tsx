import React from "react";
import { View, Text } from "react-native";
import TemplateCard from "./TemplateCard";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercise_count: number;
};

type TemplateListProps = {
  workoutTemplates: WorkoutTemplate[];
  onWorkoutPress: (workout: WorkoutTemplate) => void;
  onEditWorkout: (workout: WorkoutTemplate) => void;
  onDeleteWorkout: (workoutId: string, workoutName: string) => void;
};

export default function TemplateList({
  workoutTemplates,
  onWorkoutPress,
  onEditWorkout,
  onDeleteWorkout,
}: TemplateListProps) {
  return (
    <View className="p-4">
      {workoutTemplates.map((workout, index) => (
        <View key={workout.id}>
          <TemplateCard
            workout={workout}
            onPress={() => onWorkoutPress(workout)}
            onEdit={() => onEditWorkout(workout)}
            onDelete={() => onDeleteWorkout(workout.id, workout.name)}
          />
          {index < workoutTemplates.length - 1 && <View className="mb-3" />}
        </View>
      ))}
    </View>
  );
}

