import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseProgressData } from "../../../lib/statsUtils";

type ExerciseChartsProps = {
  exerciseData: ExerciseProgressData | null;
  volumeChartData: Array<{
    value: number;
    label: string;
    dataPointText: string;
  }>;
  weightChartData: Array<{
    value: number;
    label: string;
    dataPointText: string;
  }>;
};

export default function ExerciseCharts({
  exerciseData,
  volumeChartData,
  weightChartData,
}: ExerciseChartsProps) {
  return (
    <>
      {/* Volume Progression Summary */}
      {volumeChartData.length > 0 && (
        <View className="mb-6 bg-gray-100 dark:bg-zinc-700 rounded-xl p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="trending-up" size={20} color="#10b981" />
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white ml-2">
              {exerciseData?.exerciseName} - Volume Progression
            </Text>
          </View>

          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-900 dark:text-white">Average Volume:</Text>
              <Text className="text-lg font-bold text-primary">
                {Math.round(
                  volumeChartData.reduce((sum, item) => sum + item.value, 0) /
                    volumeChartData.length
                ).toLocaleString()}{" "}
                lbs
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-900 dark:text-white">Highest Volume:</Text>
              <Text className="text-lg font-bold text-success">
                {Math.max(...volumeChartData.map((item) => item.value)).toLocaleString()}{" "}
                lbs
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-900 dark:text-white">Total Sessions:</Text>
              <Text className="text-lg font-bold text-primary">
                {volumeChartData.length}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Max Weight Progression Summary */}
      {weightChartData.length > 0 && (
        <View className="mb-6 bg-gray-100 dark:bg-zinc-700 rounded-xl p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="barbell" size={20} color="#ff4b8c" />
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white ml-2">
              {exerciseData?.exerciseName} - Max Weight Progression
            </Text>
          </View>

          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-900 dark:text-white">Current Max:</Text>
              <Text className="text-lg font-bold text-primary">
                {Math.max(...weightChartData.map((item) => item.value))} lbs
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-900 dark:text-white">Average Max:</Text>
              <Text className="text-lg font-bold text-primary">
                {Math.round(
                  weightChartData.reduce((sum, item) => sum + item.value, 0) /
                    weightChartData.length
                )}{" "}
                lbs
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-900 dark:text-white">Progress Sessions:</Text>
              <Text className="text-lg font-bold text-primary">
                {weightChartData.length}
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

