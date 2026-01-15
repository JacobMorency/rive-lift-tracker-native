import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercise_count: number;
};

type SelectWorkoutCardProps = {
  workout: WorkoutTemplate;
  isScheduled?: boolean;
  onPress: () => void;
};

export default function SelectWorkoutCard({
  workout,
  isScheduled = false,
  onPress,
}: SelectWorkoutCardProps) {
  return (
    <TouchableOpacity
      className={`${
        isScheduled
          ? "bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 border border-primary/20"
          : "bg-gray-50 dark:bg-zinc-800"
      } rounded-xl p-4 mb-3`}
      onPress={onPress}
      style={{
        shadowColor: isScheduled ? "#ff4b8c" : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isScheduled ? 0.1 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-12 h-12 bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 rounded-xl items-center justify-center">
          <Ionicons
            name={isScheduled ? "calendar" : "barbell-outline"}
            size={24}
            color="#ff4b8c"
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
              {workout.name}
            </Text>
            {isScheduled && (
              <View className="bg-primary px-2 py-1 rounded-full">
                <Text className="text-xs font-medium text-white">
                  Scheduled Today
                </Text>
              </View>
            )}
          </View>
          {workout.description && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={2}>
              {workout.description}
            </Text>
          )}
          <View className="flex-row items-center gap-3 mt-2">
            <View className="bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded-full">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {workout.exercise_count} exercise
                {workout.exercise_count !== 1 ? "s" : ""}
              </Text>
            </View>
            {!isScheduled && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar" size={12} color="#9ca3af" />
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(workout.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="w-8 h-8 bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 rounded-full items-center justify-center">
          <Ionicons name="chevron-forward" size={16} color="#ff4b8c" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

