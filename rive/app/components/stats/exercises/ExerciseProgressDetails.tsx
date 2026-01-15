import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseProgressData } from "../../../lib/statsUtils";

type ExerciseProgressDetailsProps = {
  exerciseData: ExerciseProgressData | null;
};

export default function ExerciseProgressDetails({
  exerciseData,
}: ExerciseProgressDetailsProps) {
  return (
    <>
      {/* PR History */}
      {exerciseData?.prHistory && exerciseData.prHistory.length > 0 && (
        <View className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="trophy" size={20} color="#ff4b8c" />
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white ml-2">
              PR History
            </Text>
          </View>

          <View className="gap-3">
            {exerciseData.prHistory.slice(-5).map((pr, index) => (
              <View key={index} className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                      {pr.weight} lbs
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(pr.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 px-2 py-1 rounded">
                    <Text className="text-primary text-sm font-bold">
                      PR #{exerciseData.prHistory.length - index}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

