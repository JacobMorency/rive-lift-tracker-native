import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import {
  getScheduledWorkoutsForDateRange,
  ScheduledWorkoutWithDate,
} from "../../lib/scheduleUtils";
import AppCard from "../ui/AppCard";
import AppText from "../ui/AppText";
import AppButton from "../ui/AppButton";

export default function NextScheduledWorkout() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [nextWorkout, setNextWorkout] =
    useState<ScheduledWorkoutWithDate | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNextWorkout = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 30);

      const workouts = await getScheduledWorkoutsForDateRange(
        user.id,
        today,
        endDate,
      );

      workouts.sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate);
        }
        return a.workout_name.localeCompare(b.workout_name);
      });

      setNextWorkout(workouts.length > 0 ? workouts[0] : null);
    } catch (error) {
      console.error("Error fetching next scheduled workout:", error);
      setNextWorkout(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNextWorkout();
    }
  }, [user, fetchNextWorkout]);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return "Today";
    }
    if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleStartSession = async (workoutId: string) => {
    if (!user) return;

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
        console.error("Error creating session:", error);
        return;
      }

      router.push(`/session/${data.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  if (loading) {
    return (
      <View className="mb-6">
        <AppCard
          radius="large"
          className="border border-primary/10 dark:border-primary-dark/20 p-6"
        >
          <View className="items-center justify-center py-6">
            <ActivityIndicator
              size="small"
              color={isDark ? "#ff6fa1" : "#ff4b8c"}
            />
          </View>
        </AppCard>
      </View>
    );
  }

  if (!nextWorkout) {
    return null;
  }

  return (
    <View className="mb-6">
      <AppCard radius="large" className="p-6">
        <View className="flex-row justify-between items-start mb-5">
          <View className="flex-1 mr-3">
            <AppText variant="caption" tone="primary" className="mb-1">
              Up next
            </AppText>
            <AppText variant="subheader" className="mb-1">
              {nextWorkout.workout_name}
            </AppText>
            <AppText variant="caption" tone="muted" className="normal-case">
              Scheduled for {formatDate(nextWorkout.scheduledDate)}
            </AppText>
          </View>
          <View className="w-12 h-12 rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark items-center justify-center">
            <Ionicons
              name="calendar-outline"
              size={24}
              color={isDark ? "#ff6fa1" : "#ff4b8c"}
            />
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <AppButton
              label="Start session"
              tone="primary"
              size="lg"
              fullWidth
              onPress={() =>
                handleStartSession(nextWorkout.schedule.workout_id)
              }
            />
          </View>
          <AppButton
            tone="neutral"
            size="icon"
            onPress={() => router.push("/schedule")}
            icon={
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color={isDark ? "#f5f5f5" : "#111113"}
              />
            }
          />
        </View>
      </AppCard>
    </View>
  );
}
