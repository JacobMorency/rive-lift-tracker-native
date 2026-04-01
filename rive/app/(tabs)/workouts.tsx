import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import SelectWorkoutModal from "../components/selectworkoutmodal";
import Header from "../components/header";
import {
  getTodaysScheduledWorkouts,
  getScheduledWorkoutsForDateRange,
  ScheduledWorkoutWithDate,
} from "../lib/scheduleUtils";
import WorkoutVaultList from "../components/dashboard/WorkoutVaultList";
import QuickActionsRow from "../components/dashboard/QuickActionsRow";
import NextUpCard from "../components/dashboard/NextUpCard";
import AppText from "../components/ui/AppText";

export default function DashboardPage() {
  const [isSelectWorkoutModalOpen, setIsSelectWorkoutModalOpen] =
    useState(false);
  const [nextScheduledWorkout, setNextScheduledWorkout] =
    useState<ScheduledWorkoutWithDate | null>(null);
  const { user, userData } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch next scheduled workout
  const fetchNextScheduledWorkout = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Look ahead 30 days to find the next workout
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 30);

      const workouts = await getScheduledWorkoutsForDateRange(
        user.id,
        today,
        endDate,
      );

      // Sort by date, then by workout name
      workouts.sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate);
        }
        return a.workout_name.localeCompare(b.workout_name);
      });

      // Take only the first workout (next scheduled)
      setNextScheduledWorkout(workouts.length > 0 ? workouts[0] : null);
    } catch (error) {
      console.error("Error fetching next scheduled workout:", error);
      setNextScheduledWorkout(null);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNextScheduledWorkout();
    }
  }, [user, fetchNextScheduledWorkout]);

  const handleStartSession = async (workoutId?: string) => {
    if (!user) return;

    // If a workout ID is provided (from scheduled workout), start it directly
    if (workoutId) {
      try {
        const { data, error } = await supabase
          .from("workout_sessions")
          .insert([
            {
              user_id: user.id,
              workout_id: workoutId,
              started_at: new Date().toISOString(),
              completed: false,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error creating session:", error.message);
          return;
        }

        // Navigate to the session detail page
        router.push(`/session/${data.id}`);
      } catch (error) {
        console.error("Error creating session:", error);
      }
      return;
    }

    // Otherwise, show the select workout modal
    try {
      // Check for today's scheduled workouts
      const todaysScheduled = await getTodaysScheduledWorkouts(user.id);

      if (todaysScheduled.length > 0) {
        // Show modal with scheduled workouts prioritized
        setIsSelectWorkoutModalOpen(true);
      } else {
        // Show modal to select any workout
        setIsSelectWorkoutModalOpen(true);
      }
    } catch (error) {
      console.error("Error checking scheduled workouts:", error);
      // Fallback to showing select modal
      setIsSelectWorkoutModalOpen(true);
    }
  };

  const handleWorkoutSelect = async (workoutId: string) => {
    if (!user) return;

    try {
      // Create a new session
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([
          {
            user_id: user.id,
            workout_id: workoutId,
            started_at: new Date().toISOString(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error.message);
        return;
      }

      // Navigate to the session detail page
      router.push(`/session/${data.id}`);
      setIsSelectWorkoutModalOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <Header title="RIVE" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <AppText variant="header">Dashboard</AppText>
          {userData?.first_name && (
            <AppText variant="caption" tone="muted" className="normal-case">
              Welcome back, {userData.first_name}!
            </AppText>
          )}
        </View>

        <NextUpCard
          nextScheduledWorkout={nextScheduledWorkout}
          onStartSession={handleStartSession}
        />

        <QuickActionsRow
          onStartSession={handleStartSession}
          scheduledWorkout={nextScheduledWorkout}
        />

        <WorkoutVaultList onTemplateSelect={handleWorkoutSelect} />
      </ScrollView>

      {/* Modals */}
      <SelectWorkoutModal
        isOpen={isSelectWorkoutModalOpen}
        onClose={() => setIsSelectWorkoutModalOpen(false)}
        onWorkoutSelect={handleWorkoutSelect}
      />
    </View>
  );
}
