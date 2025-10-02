import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";

type SelectWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutSelect: (workoutId: string) => void;
};

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercise_count: number;
};

type WorkoutWithExercises = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  workout_exercises: { count: number }[];
};

const SelectWorkoutModal = ({
  isOpen,
  onClose,
  onWorkoutSelect,
}: SelectWorkoutModalProps) => {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchWorkoutTemplates();
    }
  }, [isOpen, user]);

  const fetchWorkoutTemplates = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch workout templates with exercise count
      const { data, error } = await supabase
        .from("workouts")
        .select(
          `
          id,
          name,
          description,
          created_at,
          workout_exercises(count)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workout templates:", error.message);
        return;
      }

      // Transform the data to include exercise count
      const templates =
        data?.map((workout: WorkoutWithExercises) => ({
          id: workout.id,
          name: workout.name,
          description: workout.description,
          created_at: workout.created_at,
          exercise_count: workout.workout_exercises?.[0]?.count || 0,
        })) || [];

      setWorkoutTemplates(templates);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutSelect = (workoutId: string) => {
    onWorkoutSelect(workoutId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-base-100">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-base-300">
          <Text className="text-lg font-semibold text-base-content">
            Select Workout Template ({workoutTemplates.length})
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-muted mt-2">Loading workouts...</Text>
            </View>
          ) : workoutTemplates.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-6xl mb-4">🏋️</Text>
              <Text className="text-lg font-semibold text-base-content mb-2">
                No Workout Templates
              </Text>
              <Text className="text-muted text-center">
                Create a workout template first to start a session
              </Text>
            </View>
          ) : (
            <View>
              {workoutTemplates.map((workout, index) => (
                <View key={workout.id}>
                  <TouchableOpacity
                    className="bg-base-300 rounded-lg p-4"
                    onPress={() => handleWorkoutSelect(workout.id)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-medium text-base-content">
                          {workout.name}
                        </Text>
                        {workout.description && (
                          <Text className="text-sm text-muted mt-1">
                            {workout.description}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <Text className="text-muted text-sm">
                          {workout.exercise_count} exercises
                        </Text>
                        <Text className="text-muted">›</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {index < workoutTemplates.length - 1 && (
                    <View className="mb-3" />
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SelectWorkoutModal;
