import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseProgressData } from "../../../lib/statsUtils";

type ExerciseStatsProps = {
  exerciseData: ExerciseProgressData | null;
  loading: boolean;
};

export default function ExerciseStats({
  exerciseData,
  loading,
}: ExerciseStatsProps) {
  return (
    <View className="gap-4 mb-6">
      <View className="flex-row gap-4">
        <View className="flex-1 bg-base-300 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="trophy" size={16} color="#ff4b8c" />
            <Text className="text-sm font-medium text-muted">Current PR</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#ff4b8c" />
          ) : (
            <Text className="text-2xl font-bold text-base-content">
              {exerciseData?.currentPR || 0} lbs
            </Text>
          )}
        </View>
        <View className="flex-1 bg-base-300 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="trending-up" size={16} color="#10b981" />
            <Text className="text-sm font-medium text-muted">Sessions</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <Text className="text-2xl font-bold text-base-content">
              {exerciseData?.dataPoints.length || 0}
            </Text>
          )}
        </View>
      </View>

      {/* Progression Card (always visible; neutral if insufficient data) */}
      {exerciseData?.progression && (
        <View className="bg-base-300 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons
              name={
                exerciseData.progression.trend === "up"
                  ? "trending-up"
                  : exerciseData.progression.trend === "down"
                    ? "trending-down"
                    : "remove"
              }
              size={16}
              color={
                exerciseData.progression.trend === "up"
                  ? "#10b981"
                  : exerciseData.progression.trend === "down"
                    ? "#ef4444"
                    : "#6b7280"
              }
            />
            <Text className="text-sm font-medium text-muted">
              Progression (since start of range)
            </Text>
          </View>
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-base-content">Volume Change:</Text>
              <View className="flex-row items-center gap-1">
                <Text
                  className={`text-sm font-semibold ${
                    exerciseData.progression.volumePercentage > 0
                      ? "text-success"
                      : exerciseData.progression.volumePercentage < 0
                        ? "text-error"
                        : "text-muted"
                  }`}
                >
                  {exerciseData.progression.volumePercentage > 0 ? "+" : ""}
                  {Math.abs(exerciseData.progression.volumePercentage).toFixed(1)}%
                </Text>
                <Ionicons
                  name={
                    exerciseData.progression.volumePercentage > 0
                      ? "arrow-up"
                      : exerciseData.progression.volumePercentage < 0
                        ? "arrow-down"
                        : "remove"
                  }
                  size={12}
                  color={
                    exerciseData.progression.volumePercentage > 0
                      ? "#10b981"
                      : exerciseData.progression.volumePercentage < 0
                        ? "#ef4444"
                        : "#6b7280"
                  }
                />
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-base-content">Weight Change:</Text>
              <View className="flex-row items-center gap-1">
                <Text
                  className={`text-sm font-semibold ${
                    exerciseData.progression.weightPercentage > 0
                      ? "text-success"
                      : exerciseData.progression.weightPercentage < 0
                        ? "text-error"
                        : "text-muted"
                  }`}
                >
                  {exerciseData.progression.weightPercentage > 0 ? "+" : ""}
                  {Math.abs(exerciseData.progression.weightPercentage).toFixed(1)}%
                </Text>
                <Ionicons
                  name={
                    exerciseData.progression.weightPercentage > 0
                      ? "arrow-up"
                      : exerciseData.progression.weightPercentage < 0
                        ? "arrow-down"
                        : "remove"
                  }
                  size={12}
                  color={
                    exerciseData.progression.weightPercentage > 0
                      ? "#10b981"
                      : exerciseData.progression.weightPercentage < 0
                        ? "#ef4444"
                        : "#6b7280"
                  }
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

