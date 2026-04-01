import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Modal,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
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
import AppText from "./ui/AppText";
import AppCard from "./ui/AppCard";

type SelectWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutSelect: (workoutId: string) => void;
  onNewTemplatePress?: () => void;
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

export default function SelectWorkoutModal({
  isOpen,
  onClose,
  onWorkoutSelect,
  onNewTemplatePress,
}: SelectWorkoutModalProps) {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    [],
  );
  const [scheduledWorkouts, setScheduledWorkouts] = useState<
    ScheduledWorkout[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const spinnerColor = isDark ? "#ff6fa1" : "#ff4b8c";

  const fetchWorkoutTemplates = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const [templatesResult, scheduledResult] = await Promise.all([
        supabase
          .from("workouts")
          .select(
            `
            id,
            name,
            description,
            created_at,
            workout_exercises(count)
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        getTodaysScheduledWorkouts(user.id),
      ]);

      if (templatesResult.error) {
        console.error(
          "Error fetching workout templates:",
          templatesResult.error.message,
        );
        return;
      }

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
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-background dark:bg-background-dark">
        <View
          className="bg-chrome dark:bg-chrome-dark px-4 py-4"
          style={{ paddingTop: insets.top, paddingBottom: 8 }}
        >
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close"
              className="w-10 h-10 items-center justify-center rounded-full"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-1 min-w-0">
              <AppText variant="subheader">Select workout</AppText>
              {!loading && workoutTemplates.length > 0 ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  className="normal-case mt-1"
                >
                  {`${workoutTemplates.length} template${
                    workoutTemplates.length !== 1 ? "s" : ""
                  } available`}
                </AppText>
              ) : null}
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="justify-center items-center py-16">
              <ActivityIndicator size="large" color={spinnerColor} />
              <AppText
                variant="caption"
                tone="muted"
                className="normal-case mt-4 text-center"
              >
                Loading workout templates...
              </AppText>
            </View>
          ) : workoutTemplates.length === 0 ? (
            <View className="items-center py-12">
              <AppCard className="!p-0 w-20 h-20 items-center justify-center mb-4 rounded-full overflow-hidden">
                <Ionicons name="barbell-outline" size={40} color="#9ca3af" />
              </AppCard>
              <AppText variant="subheader" className="text-center mb-2">
                No workout templates
              </AppText>
              <AppText
                variant="caption"
                tone="muted"
                className="normal-case text-center mb-6 max-w-xs"
              >
                Create a workout template first to start a session
              </AppText>
              {onNewTemplatePress ? (
                <TouchableOpacity
                  onPress={onNewTemplatePress}
                  className="flex-row items-center gap-2"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={spinnerColor}
                  />
                  <AppText
                    variant="caption"
                    tone="primary"
                    className="normal-case font-semibold"
                  >
                    Create workout
                  </AppText>
                </TouchableOpacity>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="arrow-up" size={16} color={spinnerColor} />
                  <AppText
                    variant="caption"
                    tone="primary"
                    className="normal-case"
                  >
                    Go to Workouts tab to create one
                  </AppText>
                </View>
              )}
            </View>
          ) : (
            <SelectWorkoutList
              workoutTemplates={workoutTemplates}
              scheduledWorkouts={scheduledWorkouts}
              onWorkoutSelect={handleWorkoutSelect}
              onNewTemplatePress={onNewTemplatePress}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
