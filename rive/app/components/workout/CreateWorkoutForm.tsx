import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

type CreateWorkoutFormProps = {
  workoutName: string;
  description: string;
  onClose?: () => void;
  errors: { workoutName: string; description: string };
  loading: boolean;
  onWorkoutNameChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onSubmit: () => void;
  workoutNameRef: React.RefObject<TextInput>;
};

export default function CreateWorkoutForm({
  workoutName,
  description,
  onClose,
  errors,
  loading,
  onWorkoutNameChange,
  onDescriptionChange,
  onSubmit,
  workoutNameRef,
}: CreateWorkoutFormProps) {
  return (
    <View className="flex-1">
      {/* Enhanced Header */}
      <View className="bg-background dark:bg-background-dark px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <AppText variant="subheader">New Workout</AppText>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={loading || !workoutName.trim()}
            className={`items-center justify-center rounded-full ${
              loading || !workoutName.trim()
                ? "bg-surfaceAlt dark:bg-surfaceAlt-dark"
                : "bg-primary dark:bg-primary-dark"
            }`}
          >
            <AppText className="px-8 py-2 text-sm font-bold">NEXT</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Form */}
      <ScrollView
        className="flex-1 p-6"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="gap-6">
          {/* Workout Name Field */}
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 bg-[#ff4b8c] dark:bg-[#ff6fa1]/20 rounded-lg items-center justify-center">
                <Ionicons name="fitness" size={16} color="#ff4b8c" />
              </View>
              <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
                Workout Name
              </Text>
            </View>
            <TextInput
              ref={workoutNameRef}
              className={`border-2 rounded-xl px-4 py-3 text-zinc-900 dark:text-white bg-gray-50 dark:bg-zinc-800 text-lg ${
                errors.workoutName
                  ? "border-error"
                  : "border-gray-200 dark:border-zinc-700"
              }`}
              placeholder="e.g., Upper Body Strength"
              placeholderTextColor="#9ca3af"
              value={workoutName}
              onChangeText={onWorkoutNameChange}
              maxLength={50}
              returnKeyType="next"
            />
            <View className="flex-row items-center justify-between mt-2">
              {errors.workoutName ? (
                <Text className="text-error text-sm">{errors.workoutName}</Text>
              ) : (
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Give your workout a memorable name
                </Text>
              )}
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {workoutName.length}/50
              </Text>
            </View>
          </View>

          {/* Description Field */}
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 bg-warning/20 rounded-lg items-center justify-center">
                <Ionicons name="document-text" size={16} color="#f59e0b" />
              </View>
              <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
                Description
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                (Optional)
              </Text>
            </View>
            <TextInput
              className={`border-2 rounded-xl px-4 py-3 text-zinc-900 dark:text-white bg-gray-50 dark:bg-zinc-800 text-base min-h-[100px] ${
                errors.description
                  ? "border-error"
                  : "border-gray-200 dark:border-zinc-700"
              }`}
              placeholder="Describe your workout goals, focus areas, or any special notes..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={onDescriptionChange}
              multiline
              textAlignVertical="top"
              maxLength={200}
              returnKeyType="done"
            />
            <View className="flex-row items-center justify-between mt-2">
              {errors.description ? (
                <Text className="text-error text-sm">{errors.description}</Text>
              ) : (
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Add details about your workout
                </Text>
              )}
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {description.length}/200
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
