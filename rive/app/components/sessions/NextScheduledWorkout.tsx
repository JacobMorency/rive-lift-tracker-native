import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authcontext";
import { supabase } from "../../lib/supabaseClient";
import {
  getScheduledWorkoutsForDateRange,
  ScheduledWorkoutWithDate,
} from "../../lib/scheduleUtils";

export default function NextScheduledWorkout() {
  const { user } = useAuth();
  const router = useRouter();
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

  // Don't render anything if loading and no workout yet
  if (loading && !nextWorkout) {
    return null;
  }

  // Don't render anything if no workout scheduled
  if (!loading && !nextWorkout) {
    return null;
  }

  return (
    <View
      className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="calendar-outline" size={16} color="#ff4b8c" />
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Next Scheduled
            </Text>
          </View>
          <Text className="text-base font-semibold text-zinc-900 dark:text-white">
            {nextWorkout?.workout_name}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {nextWorkout ? formatDate(nextWorkout.scheduledDate) : ""}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-[#ff4b8c] dark:bg-[#ff6fa1] rounded-lg px-4 py-2.5 flex-row items-center gap-2"
          onPress={() =>
            nextWorkout && handleStartSession(nextWorkout.schedule.workout_id)
          }
          disabled={loading || !nextWorkout}
          style={{
            shadowColor: "#ff4b8c",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="play" size={16} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">
                Start
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

