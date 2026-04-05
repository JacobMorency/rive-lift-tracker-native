import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutDetails } from "./types";
import ExerciseListItem from "./ExerciseListItem";
import AppText from "../ui/AppText";
import AppCard from "../ui/AppCard";

type WorkoutExerciseListProps = {
  workoutDetails: WorkoutDetails;
  onRemoveExercise: (exerciseId: number, exerciseName: string) => void;
  onNotesUpdate: (workoutExerciseId: string, notes: string) => void;
};

export default function WorkoutExerciseList({
  workoutDetails,
  onRemoveExercise,
  onNotesUpdate,
}: WorkoutExerciseListProps) {
  return (
    <View>
      {workoutDetails.exercises.length === 0 ? (
        <AppCard
          radius="large"
          className="items-center border border-border py-10 dark:border-border-dark"
          surface="alt"
        >
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surface dark:bg-surface-dark">
            <Ionicons name="barbell-outline" size={40} color="#9ca3af" />
          </View>
          <AppText variant="subheader" tone="default" className="mb-2 text-center">
            No exercises yet
          </AppText>
          <AppText variant="body" tone="muted" className="mb-6 max-w-xs text-center normal-case">
            Add exercises to build this template.
          </AppText>
          <AppText variant="caption" tone="primary" className="text-center normal-case font-semibold">
            Tap Add exercises to get started.
          </AppText>
        </AppCard>
      ) : (
        <View className="gap-5">
          {workoutDetails.exercises.map((exercise, index) => (
            <ExerciseListItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              onRemove={onRemoveExercise}
              onNotesUpdate={onNotesUpdate}
            />
          ))}
        </View>
      )}
    </View>
  );
}
