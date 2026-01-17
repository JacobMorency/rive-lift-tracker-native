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

type TemplateCardProps = {
  workout: WorkoutTemplate;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TemplateCard({
  workout,
  onPress,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  return (
    <View
      className="bg-gray-100 dark:bg-zinc-700 rounded-lg p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <TouchableOpacity onPress={onPress} className="flex-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-medium text-zinc-900 dark:text-white">
              {workout.name}
            </Text>
            {workout.description && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {workout.description}
              </Text>
            )}
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {workout.exercise_count} exercise
              {workout.exercise_count !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-8 h-8 bg-info rounded-full items-center justify-center"
              onPress={onEdit}
            >
              <Ionicons name="settings-outline" size={16} color="#002d40" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-8 h-8 bg-error rounded-full items-center justify-center"
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
