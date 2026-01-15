import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/authcontext";
import { getMostUsedExercises } from "../../lib/statsUtils";

import { MuscleGroup } from "../../lib/muscleGroupUtils";

type Exercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // Replaces category
  usageCount: number;
};

type ExerciseSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedExercises: number[];
  onSave: (exerciseIds: number[]) => void;
};

export default function ExerciseSelectionModal({
  isOpen,
  onClose,
  selectedExercises,
  onSave,
}: ExerciseSelectionModalProps) {
  const { user } = useAuth();
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempSelectedExercises, setTempSelectedExercises] = useState<number[]>(
    []
  );

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchExercises();
      setTempSelectedExercises(selectedExercises);
    }
  }, [isOpen, user?.id, selectedExercises]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises(availableExercises);
    } else {
      const filtered = availableExercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exercise.primaryMuscleGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, availableExercises]);

  const fetchExercises = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const exercises = await getMostUsedExercises(user.id, { type: "all" });
      setAvailableExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseToggle = (exerciseId: number) => {
    setTempSelectedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        // Always allow removing exercises
        return prev.filter((id) => id !== exerciseId);
      } else {
        // No limit - allow adding any exercise
        return [...prev, exerciseId];
      }
    });
  };

  const handleSave = () => {
    onSave(tempSelectedExercises);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedExercises(selectedExercises);
    setSearchQuery("");
    onClose();
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    return "#ff4b8c"; // All badges use primary color
  };

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white dark:bg-zinc-900">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-primary text-base font-medium">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
            Track PRs
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-primary text-base font-medium">Save</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-100 dark:bg-zinc-700 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-zinc-900 dark:text-white"
              placeholder="Search exercises..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Selected Count */}
        <View className="px-4 pb-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {tempSelectedExercises.length} exercise
            {tempSelectedExercises.length !== 1 ? "s" : ""} selected
          </Text>
        </View>

        {/* Exercise List */}
        <ScrollView className="flex-1 px-4">
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-gray-500 dark:text-gray-400 mt-2">Loading exercises...</Text>
            </View>
          ) : filteredExercises.length > 0 ? (
            <View className="gap-2 pb-4">
              {filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => handleExerciseToggle(exercise.id)}
                  className={`flex-row items-center justify-between p-4 rounded-lg border ${
                    tempSelectedExercises.includes(exercise.id)
                      ? "bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 border-primary"
                      : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  }`}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                        {exercise.name}
                      </Text>
                      {exercise.primaryMuscleGroup && (
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              getMuscleGroupColor(exercise.primaryMuscleGroup) + "20",
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: getMuscleGroupColor(exercise.primaryMuscleGroup) }}
                          >
                            {exercise.primaryMuscleGroup}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      Used {exercise.usageCount} times
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      tempSelectedExercises.includes(exercise.id)
                        ? "bg-[#ff4b8c] dark:bg-[#ff6fa1] border-[#ff4b8c] dark:border-[#ff6fa1]"
                        : "border-gray-300 dark:border-zinc-600"
                    }`}
                  >
                    {tempSelectedExercises.includes(exercise.id) && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons name="barbell-outline" size={48} color="#9ca3af" />
              <Text className="text-lg font-semibold text-zinc-900 dark:text-white mt-3 mb-2">
                No Exercises Found
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start tracking workouts to see exercises here"}
              </Text>
            </View>
          )}
        </ScrollView>

      </View>
    </Modal>
  );
}
