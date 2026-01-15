import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WorkoutDetails } from "./types";

type WorkoutHeaderProps = {
  workoutDetails: WorkoutDetails | null;
  loading: boolean;
  isEditingName: boolean;
  editingName: string;
  setEditingName: (name: string) => void;
  onEditName: () => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onDeleteWorkout: () => void;
  onClose: () => void;
};

export default function WorkoutHeader({
  workoutDetails,
  loading,
  isEditingName,
  editingName,
  setEditingName,
  onEditName,
  onSaveName,
  onCancelEdit,
  onDeleteWorkout,
  onClose,
}: WorkoutHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-gray-50 dark:bg-zinc-800 px-4 py-4 border-b border-gray-200 dark:border-zinc-700"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          onPress={onClose}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700"
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          {isEditingName ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                className="text-xl font-bold text-zinc-900 dark:text-white bg-gray-100 dark:bg-zinc-700 px-3 py-1 rounded-lg"
                value={editingName}
                onChangeText={setEditingName}
                autoFocus
                selectTextOnFocus
                onSubmitEditing={onSaveName}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={onSaveName}
                className="w-6 h-6 bg-success rounded-full items-center justify-center"
              >
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onCancelEdit}
                className="w-6 h-6 bg-error rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={onEditName}>
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                {loading
                  ? "Loading..."
                  : `${workoutDetails?.name || "Workout"}`}
              </Text>
            </TouchableOpacity>
          )}
          {workoutDetails && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {workoutDetails.exercises.length} exercise
              {workoutDetails.exercises.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onDeleteWorkout}
            className="w-10 h-10 items-center justify-center rounded-full bg-error/20"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Workout Info */}
      {workoutDetails && workoutDetails.description && (
        <View className="bg-gray-100 dark:bg-zinc-700 rounded-lg p-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="document-text" size={14} color="#9ca3af" />
            <Text className="text-xs text-gray-500 dark:text-gray-400">Has description</Text>
          </View>
        </View>
      )}
    </View>
  );
}

