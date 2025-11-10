import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import SelectWorkoutModal from "../components/selectworkoutmodal";
import Header from "../components/header";
import {
  getTodaysScheduledWorkouts,
  getScheduledWorkoutsForDateRange,
  ScheduledWorkoutWithDate,
} from "../lib/scheduleUtils";
import QuickActions from "../components/dashboard/QuickActions";
import TemplatesSection from "../components/dashboard/TemplatesSection";

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
        endDate
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
    <View className="flex-1 bg-base-100">
      <Header
        title="Dashboard"
        subtitle={
          userData ? `Welcome back, ${userData.first_name}! 💪` : undefined
        }
      />

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Quick Actions */}
        <QuickActions
          onStartSession={handleStartSession}
          scheduledWorkout={nextScheduledWorkout}
        />

        {/* Workout Templates - Prominent Section */}
        <TemplatesSection />
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
