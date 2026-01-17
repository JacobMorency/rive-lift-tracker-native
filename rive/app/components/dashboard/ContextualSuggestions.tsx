import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authcontext";
import {
  getScheduledWorkoutsForDateRange,
  ScheduledWorkoutWithDate,
} from "../../lib/scheduleUtils";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

type ContextualSuggestionsProps = {
  onStartWorkout?: (workoutId: string) => void;
};

export default function ContextualSuggestions({
  onStartWorkout,
}: ContextualSuggestionsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<
    ScheduledWorkoutWithDate[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchUpcomingWorkouts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get next 7 days of workouts
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);

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

      // Limit to next 3 workouts for cleaner UI
      setUpcomingWorkouts(workouts.slice(0, 3));
    } catch (error) {
      console.error("Error fetching upcoming workouts:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUpcomingWorkouts();
    }
  }, [user, fetchUpcomingWorkouts]);

  // Only render if there are upcoming workouts
  if (upcomingWorkouts.length === 0 && !loading) {
    return null;
  }

  const formatDate = (dateString: string): string => {
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

  const handleWorkoutPress = (workout: ScheduledWorkoutWithDate) => {
    if (onStartWorkout) {
      onStartWorkout(workout.schedule.workout_id);
    }
  };

  return (
    <View>
      <SectionHeader
        icon="calendar-outline"
        title="Upcoming Workouts"
        action={
          upcomingWorkouts.length > 0
            ? {
                label: "View All",
                onPress: () => router.push("/schedule"),
              }
            : undefined
        }
      />
      {loading ? (
        <Card variant="elevated">
          <View className="py-4 items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </Text>
          </View>
        </Card>
      ) : (
        <View className="gap-3">
          {upcomingWorkouts.map((workout, index) => (
            <Card
              key={`${workout.schedule.id}-${workout.scheduledDate}-${index}`}
              variant="elevated"
              onPress={() => handleWorkoutPress(workout)}
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
                    {workout.workout_name}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(workout.scheduledDate)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className={`px-3 py-1.5 rounded-lg ${
                    isDark ? "bg-[#ff6fa1]/20" : "bg-[#ff4b8c]/20"
                  }`}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleWorkoutPress(workout);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isDark ? "text-[#ff6fa1]" : "text-[#ff4b8c]"
                    }`}
                  >
                    Start
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
