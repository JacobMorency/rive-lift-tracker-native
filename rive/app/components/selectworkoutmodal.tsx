import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import {
  getTodaysScheduledWorkouts,
  ScheduledWorkout,
} from "../lib/scheduleUtils";
import SelectWorkoutList from "./workout/SelectWorkoutList";

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
  const [scheduledWorkouts, setScheduledWorkouts] = useState<
    ScheduledWorkout[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const fetchWorkoutTemplates = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch both workout templates and scheduled workouts
      const [templatesResult, scheduledResult] = await Promise.all([
        // Fetch workout templates with exercise count
        supabase
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
          .order("created_at", { ascending: false }),
        // Fetch today's scheduled workouts
        getTodaysScheduledWorkouts(user.id),
      ]);

      if (templatesResult.error) {
        console.error(
          "Error fetching workout templates:",
          templatesResult.error.message
        );
        return;
      }

      // Transform the data to include exercise count
      const templates =
        templatesResult.data?.map((workout: WorkoutWithExercises) => ({
          id: workout.id,
          name: workout.name,
          description: workout.description,
          created_at: workout.created_at,
          exercise_count: workout.workout_exercises?.[0]?.count || 0,
        })) || [];

      setWorkoutTemplates(templates);
      setScheduledWorkouts(scheduledResult);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchWorkoutTemplates();
    }
  }, [isOpen, user, fetchWorkoutTemplates]);

  const handleWorkoutSelect = (workoutId: string) => {
    onWorkoutSelect(workoutId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white dark:bg-zinc-900">
        {/* Enhanced Header */}
        <View
          className="bg-gray-50 dark:bg-zinc-800 px-4 py-4 border-b border-gray-200 dark:border-zinc-700"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                Select Workout Template
              </Text>
              {!loading && (
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {workoutTemplates.length} template
                  {workoutTemplates.length !== 1 ? "s" : ""} available
                </Text>
              )}
            </View>

            <View className="w-10 h-10" />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
                Loading workout templates...
              </Text>
            </View>
          ) : workoutTemplates.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <View className="w-20 h-20 bg-gray-100 dark:bg-zinc-700 rounded-full items-center justify-center mb-4">
                <Ionicons name="barbell-outline" size={40} color="#9ca3af" />
              </View>
              <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                No Workout Templates
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
                Create a workout template first to start a session
              </Text>
              <View className="flex-row items-center gap-2">
                <Ionicons name="arrow-up" size={16} color="#ff4b8c" />
                <Text className="text-sm font-medium text-[#ff4b8c] dark:text-[#ff6fa1]">
                  Go to Workouts tab to create one
                </Text>
              </View>
            </View>
          ) : (
            <SelectWorkoutList
              workoutTemplates={workoutTemplates}
              scheduledWorkouts={scheduledWorkouts}
              onWorkoutSelect={handleWorkoutSelect}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SelectWorkoutModal;
