import React, { useState } from "react";
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
import { getTodaysScheduledWorkouts } from "../lib/scheduleUtils";
import QuickActions from "../components/dashboard/QuickActions";
import TemplatesSection from "../components/dashboard/TemplatesSection";

export default function DashboardPage() {
  const [isSelectWorkoutModalOpen, setIsSelectWorkoutModalOpen] =
    useState(false);
  const { user, userData } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleStartSession = async () => {
    if (!user) return;

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
        <QuickActions onStartSession={handleStartSession} />

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
