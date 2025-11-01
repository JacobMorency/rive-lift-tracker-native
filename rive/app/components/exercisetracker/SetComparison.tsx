import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet as StatsExerciseSet } from "../../lib/statsUtils";
import { ExerciseSet } from "./types";

type SetComparisonProps = {
  currentSet: ExerciseSet | null;
  lastSet: StatsExerciseSet;
  setIndex: number;
  sets: ExerciseSet[];
};

export default function SetComparison({
  currentSet,
  lastSet,
  setIndex,
  sets,
}: SetComparisonProps) {
  // Get the corresponding completed set from current session if it exists
  const completedSet = sets[setIndex];

  // Use completed set if available, otherwise use currentSet
  const activeSet = completedSet || currentSet;

  const currentWeight = activeSet?.weight ?? 0;
  const currentReps = activeSet?.is_unilateral
    ? (activeSet.left_reps || 0) + (activeSet.right_reps || 0)
    : activeSet?.reps || 0;

  const lastWeight = lastSet.weight || 0;
  const lastReps = lastSet.is_unilateral
    ? (lastSet.left_reps || 0) + (lastSet.right_reps || 0)
    : lastSet.reps || 0;

  const hasCurrentData = currentWeight > 0 || currentReps > 0;
  const weightProgress = hasCurrentData
    ? currentWeight > lastWeight
      ? "up"
      : currentWeight < lastWeight
        ? "down"
        : "same"
    : "neutral";
  const repsProgress = hasCurrentData
    ? currentReps > lastReps
      ? "up"
      : currentReps < lastReps
        ? "down"
        : "same"
    : "neutral";

  const weightPercentage =
    lastWeight > 0
      ? Math.round(((currentWeight - lastWeight) / lastWeight) * 100)
      : 0;
  const repsPercentage =
    lastReps > 0
      ? Math.round(((currentReps - lastReps) / lastReps) * 100)
      : 0;

  return (
    <View className="bg-base-200 rounded-lg p-2">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-base-content">
          Set {setIndex + 1}
        </Text>
        <View className="flex-row items-center gap-1">
          {weightProgress === "up" && (
            <Ionicons name="arrow-up" size={12} color="#10b981" />
          )}
          {weightProgress === "down" && (
            <Ionicons name="arrow-down" size={12} color="#ef4444" />
          )}
          {weightProgress === "same" && (
            <Ionicons name="remove" size={12} color="#6b7280" />
          )}
          {weightProgress === "neutral" && (
            <Ionicons name="ellipse-outline" size={12} color="#9ca3af" />
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        {/* Last Session */}
        <View className="flex-1">
          <Text className="text-xs text-muted mb-1">Last Session</Text>
          <View className="flex-row items-center gap-2">
            <View className="bg-base-300 px-2 py-1 rounded">
              <Text className="text-sm font-semibold text-base-content">
                {lastWeight} lbs
              </Text>
            </View>
            <View className="bg-base-300 px-2 py-1 rounded">
              <Text className="text-sm font-semibold text-base-content">
                {lastReps} reps
              </Text>
            </View>
          </View>
        </View>

        {/* Current Session */}
        <View className="flex-1 items-end">
          <Text className="text-xs text-muted mb-1">Current</Text>
          <View className="flex-row items-center gap-2">
            <View
              className={`px-2 py-1 rounded ${
                weightProgress === "up"
                  ? "bg-success/20"
                  : weightProgress === "down"
                    ? "bg-error/20"
                    : weightProgress === "neutral"
                      ? "bg-base-300/50"
                      : "bg-base-300"
              }`}
            >
              <View className="flex-row items-center gap-1">
                <Text
                  className={`text-sm font-semibold ${
                    weightProgress === "up"
                      ? "text-success"
                      : weightProgress === "down"
                        ? "text-error"
                        : weightProgress === "neutral"
                          ? "text-muted"
                          : "text-base-content"
                  }`}
                >
                  {currentWeight || "--"} lbs
                </Text>
                {hasCurrentData && weightPercentage !== 0 && (
                  <Text
                    className={`text-xs ${
                      weightProgress === "up"
                        ? "text-success"
                        : weightProgress === "down"
                          ? "text-error"
                          : "text-muted"
                    }`}
                  >
                    {weightPercentage > 0 ? "+" : ""}
                    {weightPercentage}%
                  </Text>
                )}
              </View>
            </View>
            <View
              className={`px-2 py-1 rounded ${
                repsProgress === "up"
                  ? "bg-success/20"
                  : repsProgress === "down"
                    ? "bg-error/20"
                    : repsProgress === "neutral"
                      ? "bg-base-300/50"
                      : "bg-base-300"
              }`}
            >
              <View className="flex-row items-center gap-1">
                <Text
                  className={`text-sm font-semibold ${
                    repsProgress === "up"
                      ? "text-success"
                      : repsProgress === "down"
                        ? "text-error"
                        : repsProgress === "neutral"
                          ? "text-muted"
                          : "text-base-content"
                  }`}
                >
                  {currentReps || "--"} reps
                </Text>
                {hasCurrentData && repsPercentage !== 0 && (
                  <Text
                    className={`text-xs ${
                      repsProgress === "up"
                        ? "text-success"
                        : repsProgress === "down"
                          ? "text-error"
                          : "text-muted"
                    }`}
                  >
                    {repsPercentage > 0 ? "+" : ""}
                    {repsPercentage}%
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

