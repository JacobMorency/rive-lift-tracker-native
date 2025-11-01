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
        <View className="bg-base-300 rounded-xl p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="trophy" size={20} color="#ff4b8c" />
            <Text className="text-lg font-semibold text-base-content ml-2">
              PR History
            </Text>
          </View>

          <View className="gap-3">
            {exerciseData.prHistory.slice(-5).map((pr, index) => (
              <View key={index} className="bg-base-200 rounded-lg p-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-semibold text-base-content">
                      {pr.weight} lbs
                    </Text>
                    <Text className="text-sm text-muted">
                      {new Date(pr.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="bg-primary/10 px-2 py-1 rounded">
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

