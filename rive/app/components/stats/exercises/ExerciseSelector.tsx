import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExerciseOption } from "./types";

type ExerciseSelectorProps = {
  exercises: ExerciseOption[];
  selectedExerciseId: number | null;
  onSelectExercise: (id: number) => void;
  loading: boolean;
};

export default function ExerciseSelector({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  loading,
}: ExerciseSelectorProps) {
  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const insets = useSafeAreaInsets();

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-base-content">
          Your Most Used Exercises
        </Text>
        {exercises.length > 0 && (
          <TouchableOpacity
            className="px-3 py-2 rounded-lg bg-base-300"
            onPress={() => setIsSelectorOpen(true)}
          >
            <Text className="text-sm text-base-content">Browse</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View className="flex-row justify-center py-4">
          <ActivityIndicator size="small" color="#ff4b8c" />
          <Text className="text-muted ml-2">Loading exercises...</Text>
        </View>
      ) : exercises.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => onSelectExercise(exercise.id)}
                className={`px-4 py-3 rounded-lg ${
                  selectedExerciseId === exercise.id
                    ? "bg-primary"
                    : "bg-base-300"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-medium ${
                        selectedExerciseId === exercise.id
                          ? "text-primary-content"
                          : "text-base-content"
                      }`}
                      numberOfLines={1}
                    >
                      {exercise.name}
                    </Text>
                    <Text
                      className={`text-xs ${
                        selectedExerciseId === exercise.id
                          ? "text-primary-content/70"
                          : "text-muted"
                      }`}
                    >
                      {exercise.usageCount} uses
                    </Text>
                  </View>
                  <View className="ml-2 items-center">
                    <Ionicons
                      name={
                        exercise.progressionTrend === "up"
                          ? "trending-up"
                          : exercise.progressionTrend === "down"
                            ? "trending-down"
                            : "remove"
                      }
                      size={16}
                      color={
                        exercise.progressionTrend === "up"
                          ? "#10b981"
                          : exercise.progressionTrend === "down"
                            ? "#ef4444"
                            : selectedExerciseId === exercise.id
                              ? "#ffffff"
                              : "#6b7280"
                      }
                    />
                    {exercise.progressionTrend !== "stable" && (
                      <Text
                        className={`text-xs font-medium ${
                          exercise.progressionTrend === "up"
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {exercise.progressionTrend === "up" ? "+" : ""}
                        {Math.abs(exercise.progressionPercentage).toFixed(0)}%
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="bg-base-300 rounded-lg p-6 items-center">
          <Ionicons name="barbell-outline" size={48} color="#9ca3af" />
          <Text className="text-lg font-semibold text-base-content mt-3 mb-2">
            No Exercises Yet
          </Text>
          <Text className="text-muted text-center">
            Start tracking your workouts to see your most used exercises here
          </Text>
        </View>
      )}

      {/* Searchable Exercise Modal */}
      <Modal visible={isSelectorOpen} animationType="slide" transparent>
        <View
          className="flex-1 bg-base-100/95 px-4 py-6"
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-base-content">
              Select Exercise
            </Text>
            <TouchableOpacity onPress={() => setIsSelectorOpen(false)}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="mb-4 bg-base-300 rounded-lg px-3">
            <TextInput
              placeholder="Search by name or category"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="py-3 text-base text-base-content"
            />
          </View>

          <ScrollView className="flex-1">
            <View className="gap-2">
              {exercises
                .filter((e) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    e.name.toLowerCase().includes(q) ||
                    e.category.toLowerCase().includes(q)
                  );
                })
                .sort((a, b) => b.usageCount - a.usageCount)
                .map((exercise) => (
                  <TouchableOpacity
                    key={`modal-${exercise.id}`}
                    className="p-3 rounded-lg bg-base-300"
                    onPress={() => {
                      onSelectExercise(exercise.id);
                      setIsSelectorOpen(false);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-3">
                        <Text
                          className="text-base font-semibold text-base-content"
                          numberOfLines={1}
                        >
                          {exercise.name}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <View className="px-2 py-0.5 rounded-full bg-primary/10">
                            <Text className="text-xs text-primary">
                              {exercise.category}
                            </Text>
                          </View>
                          <Text className="text-xs text-muted">
                            {exercise.usageCount} uses
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#6b7280"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

