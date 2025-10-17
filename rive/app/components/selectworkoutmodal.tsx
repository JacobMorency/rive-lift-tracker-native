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
      <View className="flex-1 bg-base-100">
        {/* Enhanced Header */}
        <View
          className="bg-base-200 px-4 py-4 border-b border-base-300"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-base-300"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-base-content">
                Select Workout Template
              </Text>
              {!loading && (
                <Text className="text-sm text-muted mt-1">
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
              <Text className="text-muted mt-3 text-center">
                Loading workout templates...
              </Text>
            </View>
          ) : workoutTemplates.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
                <Ionicons name="barbell-outline" size={40} color="#9ca3af" />
              </View>
              <Text className="text-xl font-bold text-base-content mb-2">
                No Workout Templates
              </Text>
              <Text className="text-muted text-center mb-6 max-w-xs">
                Create a workout template first to start a session
              </Text>
              <View className="flex-row items-center gap-2">
                <Ionicons name="arrow-up" size={16} color="#ff4b8c" />
                <Text className="text-sm font-medium text-primary">
                  Go to Workouts tab to create one
                </Text>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              {/* Scheduled Workouts Section */}
              {scheduledWorkouts.length > 0 && (
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-base-content mb-3">
                    Scheduled for Today
                  </Text>
                  {scheduledWorkouts.map((scheduledWorkout) => {
                    const workout = workoutTemplates.find(
                      (w) => w.id === scheduledWorkout.schedule.workout_id
                    );
                    if (!workout) return null;

                    return (
                      <TouchableOpacity
                        key={`scheduled-${workout.id}`}
                        className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-3"
                        onPress={() => handleWorkoutSelect(workout.id)}
                        style={{
                          shadowColor: "#ff4b8c",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        <View className="flex-row items-center gap-4">
                          <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center">
                            <Ionicons
                              name="calendar"
                              size={24}
                              color="#ff4b8c"
                            />
                          </View>

                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text className="text-lg font-semibold text-base-content">
                                {workout.name}
                              </Text>
                              <View className="bg-primary px-2 py-1 rounded-full">
                                <Text className="text-xs font-medium text-primary-content">
                                  Scheduled Today
                                </Text>
                              </View>
                            </View>
                            {workout.description && (
                              <Text
                                className="text-sm text-muted mt-1"
                                numberOfLines={2}
                              >
                                {workout.description}
                              </Text>
                            )}
                            <View className="flex-row items-center gap-3 mt-2">
                              <View className="bg-base-300 px-2 py-1 rounded-full">
                                <Text className="text-xs text-muted">
                                  {workout.exercise_count} exercise
                                  {workout.exercise_count !== 1 ? "s" : ""}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center">
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color="#ff4b8c"
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* All Workout Templates Section */}
              <View>
                <Text className="text-lg font-semibold text-base-content mb-3">
                  All Workout Templates
                </Text>
                {workoutTemplates.map((workout, index) => {
                  // Skip if this workout is already shown in scheduled section
                  const isScheduled = scheduledWorkouts.some(
                    (sw) => sw.schedule.workout_id === workout.id
                  );
                  if (isScheduled) return null;

                  return (
                    <TouchableOpacity
                      key={workout.id}
                      className="bg-base-200 rounded-xl p-4 mb-3"
                      onPress={() => handleWorkoutSelect(workout.id)}
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View className="flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center">
                          <Ionicons
                            name="barbell-outline"
                            size={24}
                            color="#ff4b8c"
                          />
                        </View>

                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-base-content">
                            {workout.name}
                          </Text>
                          {workout.description && (
                            <Text
                              className="text-sm text-muted mt-1"
                              numberOfLines={2}
                            >
                              {workout.description}
                            </Text>
                          )}
                          <View className="flex-row items-center gap-3 mt-2">
                            <View className="bg-base-300 px-2 py-1 rounded-full">
                              <Text className="text-xs text-muted">
                                {workout.exercise_count} exercise
                                {workout.exercise_count !== 1 ? "s" : ""}
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="calendar"
                                size={12}
                                color="#9ca3af"
                              />
                              <Text className="text-xs text-muted">
                                {new Date(
                                  workout.created_at
                                ).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center">
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#ff4b8c"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SelectWorkoutModal;
