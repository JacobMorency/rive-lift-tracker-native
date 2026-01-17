import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutDetails } from "./types";
import ExerciseListItem from "./ExerciseListItem";

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
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-zinc-900 dark:text-white">
          Exercises
        </Text>
        <View className="bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 px-3 py-1 rounded-full">
          <Text className="text-sm font-medium text-primary">
            {workoutDetails.exercises.length} total
          </Text>
        </View>
      </View>

      {workoutDetails.exercises.length === 0 ? (
        <View className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-8 items-center">
          <View className="w-20 h-20 bg-gray-100 dark:bg-zinc-700 rounded-full items-center justify-center mb-4">
            <Ionicons name="barbell-outline" size={40} color="#9ca3af" />
          </View>
          <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            No Exercises Yet
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
            This workout template is empty. Add some exercises to get started!
          </Text>
          <View className="flex-row items-center gap-2">
            <Ionicons name="arrow-down" size={16} color="#ff4b8c" />
            <Text className="text-sm font-medium text-primary">
              Tap &quot;Add Exercises&quot; below
            </Text>
          </View>
        </View>
      ) : (
        <View className="gap-3">
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
