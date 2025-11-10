import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PersonalRecord } from "../../lib/statsUtils";

type QuickInsightsProps = {
  topExercises: Array<{
    id: number;
    name: string;
    primaryMuscleGroup?: string;
    usageCount: number;
  }>;
  topMuscleGroup: {
    name: string;
    volume: number;
    percentage?: number;
  } | null;
  recentPRs: PersonalRecord[];
  loading: boolean;
};

export default function QuickInsights({
  topExercises,
  topMuscleGroup,
  recentPRs,
  loading,
}: QuickInsightsProps) {
  const router = useRouter();

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k lbs`;
    }
    return `${Math.round(volume).toLocaleString()} lbs`;
  };

  if (loading) {
    return (
      <View className="bg-base-300 rounded-xl p-6 mb-6">
        <Text className="text-lg font-semibold text-base-content mb-4">
          Quick Insights
        </Text>
        <Text className="text-sm text-muted">Loading...</Text>
      </View>
    );
  }

  const hasData = topExercises.length > 0 || topMuscleGroup || recentPRs.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <View className="bg-base-300 rounded-xl p-6 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-base-content">
          Quick Insights
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/stats")}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm text-primary font-medium">View Stats</Text>
          <Ionicons name="chevron-forward" size={16} color="#ff4b8c" />
        </TouchableOpacity>
      </View>

      <View className="gap-4">
        {/* Top Exercises */}
        {topExercises.length > 0 && (
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="list" size={16} color="#ff4b8c" />
              <Text className="text-sm font-medium text-muted">
                Top Exercises This Week
              </Text>
            </View>
            <View className="gap-2">
              {topExercises.slice(0, 3).map((exercise, index) => (
                <View
                  key={exercise.id}
                  className="flex-row items-center gap-2 bg-base-200 rounded-lg p-2"
                >
                  <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                    <Text className="text-xs font-bold text-primary-content">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-base-content">
                      {exercise.name}
                    </Text>
                    <Text className="text-xs text-muted">
                      {exercise.usageCount} uses
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Muscle Group */}
        {topMuscleGroup && (
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="body" size={16} color="#10b981" />
              <Text className="text-sm font-medium text-muted">
                Most Trained Muscle Group
              </Text>
            </View>
            <View className="bg-base-200 rounded-lg p-3">
              <Text className="text-base font-semibold text-base-content">
                {topMuscleGroup.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-xs text-muted">
                  {formatVolume(topMuscleGroup.volume)}
                </Text>
                {typeof topMuscleGroup.percentage === "number" && (
                  <Text className="text-xs text-muted">
                    • {topMuscleGroup.percentage}% of volume
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Recent PRs */}
        {recentPRs.length > 0 && (
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="trophy" size={16} color="#f59e0b" />
              <Text className="text-sm font-medium text-muted">
                Recent PRs
              </Text>
            </View>
            <View className="gap-2">
              {recentPRs.slice(0, 2).map((pr, index) => (
                <View
                  key={index}
                  className="bg-base-200 rounded-lg p-2 flex-row items-center gap-2"
                >
                  <Ionicons name="trophy" size={16} color="#f59e0b" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-base-content">
                      {pr.exercise_name}
                    </Text>
                    <Text className="text-xs text-muted">
                      {pr.max_weight} lbs × {pr.max_reps} reps
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

