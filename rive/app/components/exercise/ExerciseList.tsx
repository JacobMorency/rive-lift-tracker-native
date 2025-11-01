import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "./types";
import ExerciseCard from "./ExerciseCard";

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
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-base-content">
          {selectedFilter || "All"} Exercises
        </Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-sm font-medium text-primary">
            {exercises.length} available
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <Text className="text-muted mt-3 text-center">
            Loading exercises...
          </Text>
        </View>
      ) : exercises.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
            <Ionicons name="search" size={32} color="#9ca3af" />
          </View>
          <Text className="text-lg font-semibold text-base-content mb-2">
            No exercises found
          </Text>
          <Text className="text-muted text-center">
            Try adjusting your search or filter criteria
          </Text>
        </View>
      ) : (
        <View className="gap-2">
          {exercises.map((exercise) => {
            const isSelected = selectedExercises.some(
              (ex) => ex.id === exercise.id
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

