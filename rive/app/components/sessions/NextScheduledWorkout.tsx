import React, { useState, useEffect, useCallback } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { useAuth } from "../../context/authcontext";
import { supabase } from "../../lib/supabaseClient";
import {
  getScheduledWorkoutsForDateRange,
  ScheduledWorkoutWithDate,
} from "../../lib/scheduleUtils";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function NextScheduledWorkout() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [nextWorkout, setNextWorkout] = useState<
    ScheduledWorkoutWithDate | null
  >(null);
  const [loading, setLoading] = useState(false);

  const fetchNextWorkout = useCallback(async () => {
    if (!user) return;

    setLoading(true);
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
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
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

  // Don't render anything if no workout scheduled
  if (!loading && !nextWorkout) {
    return null;
  }

  return (
    <View>
      <SectionHeader icon="calendar-outline" title="Up Next" />
      <Card
        variant="elevated"
        onPress={() =>
          nextWorkout && handleStartSession(nextWorkout.schedule.workout_id)
        }
      >
        <View className="flex-row items-center gap-4">
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              isDark ? "bg-[#ff6fa1]/20" : "bg-[#ff4b8c]/20"
            }`}
          >
            <Ionicons
              name="calendar"
              size={24}
              color={isDark ? "#ff6fa1" : "#ff4b8c"}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-zinc-900 dark:text-white">
              {nextWorkout?.workout_name}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Ionicons
                name="time-outline"
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {nextWorkout ? formatDate(nextWorkout.scheduledDate) : ""}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

