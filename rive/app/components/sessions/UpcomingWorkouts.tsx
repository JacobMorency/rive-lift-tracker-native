import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authcontext";
import { supabase } from "../../lib/supabaseClient";
import {
  getScheduledWorkoutsForDateRange,
  ScheduledWorkoutWithDate,
  deleteSchedule,
} from "../../lib/scheduleUtils";
import ScheduleWorkoutModal from "../scheduleworkoutmodal";

export default function UpcomingWorkouts() {
  const { user } = useAuth();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<
    ScheduledWorkoutWithDate[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const fetchUpcomingWorkouts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7); // Next 7 days

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

      setUpcomingWorkouts(workouts);
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
        weekday: "short",
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

  const handleDelete = async (scheduleId: string) => {
    const success = await deleteSchedule(scheduleId);
    if (success) {
      fetchUpcomingWorkouts();
    }
  };

  const handleScheduleCreated = () => {
    fetchUpcomingWorkouts();
  };

  // Group workouts by date
  const groupedWorkouts = upcomingWorkouts.reduce(
    (acc, workout) => {
      if (!acc[workout.scheduledDate]) {
        acc[workout.scheduledDate] = [];
      }
      acc[workout.scheduledDate].push(workout);
      return acc;
    },
    {} as Record<string, ScheduledWorkoutWithDate[]>
  );

  const sortedDates = Object.keys(groupedWorkouts).sort();

  return (
    <>
      <View
        className="bg-base-300 rounded-xl p-4 mx-4 mb-2"
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
        <View
          className={`flex-row items-center justify-between ${isExpanded && upcomingWorkouts.length > 0 ? "mb-2" : ""}`}
        >
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            className="flex-row items-center flex-1"
            disabled={upcomingWorkouts.length === 0 && !loading}
          >
            <Ionicons name="calendar" size={16} color="#ff4b8c" />
            <View className="ml-2">
              <Text className="text-sm font-semibold text-base-content">
                Upcoming Workouts
              </Text>
              {upcomingWorkouts.length > 0 && (
                <Text className="text-xs text-muted">
                  {upcomingWorkouts.length} workout
                  {upcomingWorkouts.length !== 1 ? "s" : ""} scheduled
                </Text>
              )}
              {upcomingWorkouts.length === 0 && !loading && (
                <Text className="text-xs text-muted">
                  No workouts scheduled
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setIsScheduleModalOpen(true)}
              className="px-3 py-1.5 bg-primary rounded-lg flex-row items-center gap-1"
            >
              <Ionicons name="add" size={14} color="#ffffff" />
              <Text className="text-xs font-medium text-primary-content">
                Schedule
              </Text>
            </TouchableOpacity>
            {upcomingWorkouts.length > 0 && (
              <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                className="p-1"
              >
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#6b7280"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {(isExpanded || (upcomingWorkouts.length === 0 && !loading)) && (
          <View className="mt-3">
            {loading ? (
              <View className="py-4 items-center">
                <Text className="text-xs text-muted">Loading...</Text>
              </View>
            ) : upcomingWorkouts.length === 0 ? (
              <View className="py-4 items-center">
                <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
                <Text className="text-sm text-muted text-center mt-2">
                  No workouts scheduled for the next 7 days
                </Text>
                <TouchableOpacity
                  onPress={() => setIsScheduleModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-primary rounded-lg"
                >
                  <Text className="text-sm font-medium text-primary-content">
                    Schedule Your First Workout
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                className="max-h-[300px]"
                showsVerticalScrollIndicator={true}
              >
                <View className="gap-3">
                  {sortedDates.map((date) => (
                    <View key={date} className="gap-2">
                      <Text className="text-xs font-semibold text-muted uppercase">
                        {formatDate(date)}
                      </Text>
                      {groupedWorkouts[date].map((workout) => (
                        <View
                          key={`${workout.schedule.id}-${date}`}
                          className="bg-base-200 rounded-lg p-3 flex-row items-center justify-between"
                        >
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-base-content">
                              {workout.workout_name}
                            </Text>
                            {workout.workout_description && (
                              <Text className="text-xs text-muted mt-0.5">
                                {workout.workout_description}
                              </Text>
                            )}
                          </View>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              className="bg-primary rounded-lg px-3 py-1.5 flex-row items-center gap-1"
                              onPress={() =>
                                handleStartSession(workout.schedule.workout_id)
                              }
                            >
                              <Ionicons name="play" size={14} color="#ffffff" />
                              <Text className="text-xs font-medium text-primary-content">
                                Start
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDelete(workout.schedule.id)}
                              className="p-1.5"
                            >
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#ef4444"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Schedule Workout Modal */}
      <ScheduleWorkoutModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleCreated={handleScheduleCreated}
      />
    </>
  );
}
