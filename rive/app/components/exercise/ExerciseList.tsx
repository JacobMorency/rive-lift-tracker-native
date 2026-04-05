import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "./types";
import ExerciseCard from "./ExerciseCard";
import AppText from "../ui/AppText";

type ExerciseListProps = {
  exercises: Exercise[];
  selectedExercises: Exercise[];
  loading: boolean;
  selectedFilter: string;
  onToggleExercise: (exercise: Exercise) => void;
};

export default function ExerciseList({
  exercises,
  selectedExercises,
  loading,
  selectedFilter,
  onToggleExercise,
}: ExerciseListProps) {
  return (
    <View>
      {loading ? (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <AppText className="text-textMuted dark:text-textMuted-dark mt-3 text-center">
            Loading exercises...
          </AppText>
        </View>
      ) : exercises.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <View className="w-20 h-20 bg-surface dark:bg-surface-dark rounded-full items-center justify-center mb-4">
            <Ionicons name="search" size={32} color="#9ca3af" />
          </View>
          <AppText className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            No exercises found
          </AppText>
          <AppText className="text-textMuted dark:text-textMuted-dark text-center text-sm">
            Try adjusting your search or filter criteria
          </AppText>
        </View>
      ) : (
        <View className="gap-2">
          {exercises.map((exercise) => {
            const isSelected = selectedExercises.some(
              (ex) => ex.id === exercise.id,
            );

            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isSelected={isSelected}
                onToggle={() => onToggleExercise(exercise)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
