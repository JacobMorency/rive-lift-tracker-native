import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";
import SessionExerciseCard from "./SessionExerciseCard";

export type SessionExerciseListItem = {
  id: number;
  name: string;
  primaryMuscleGroup?: string;
};

export type SessionExerciseProgressSlice = {
  completed: boolean;
  setCount: number;
  hasStarted: boolean;
};

type SessionExerciseListProps = {
  exercises: SessionExerciseListItem[];
  progress: SessionExerciseProgressSlice[];
  formatExerciseName: (name: string) => string;
  onExercisePress: (index: number) => void;
  onRemoveExercise: (index: number) => void;
};

export default function SessionExerciseList({
  exercises,
  progress,
  formatExerciseName,
  onExercisePress,
  onRemoveExercise,
}: SessionExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <View className="items-center py-10 px-4">
        <View className="w-16 h-16 rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark items-center justify-center mb-4">
          <Ionicons name="barbell-outline" size={32} color="#ff4b8c" />
        </View>
        <AppText variant="subheader" tone="default" className="text-center mb-2 normal-case font-bold">
          No exercises
        </AppText>
        <AppText
          variant="body"
          tone="muted"
          className="text-center normal-case max-w-xs"
        >
          This workout template has no exercises. Add one to get started.
        </AppText>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {exercises.map((exercise, index) => {
        const p = progress[index];
        return (
          <SessionExerciseCard
            key={exercise.id}
            formattedName={formatExerciseName(exercise.name)}
            subtitle={exercise.primaryMuscleGroup || "Exercise"}
            setCount={p?.setCount ?? 0}
            isCompleted={p?.completed ?? false}
            hasStarted={p?.hasStarted ?? false}
            onPress={() => onExercisePress(index)}
            onRemove={() => onRemoveExercise(index)}
          />
        );
      })}
    </View>
  );
}
