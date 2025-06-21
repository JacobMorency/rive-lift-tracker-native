"use client";

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import WorkoutHistoryCard from "../../components/workouthistory/workouthistorycard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Workout } from "@/types/workout";

type WorkoutHistoryTabProps = {
  workouts: Workout[];
};

const WorkoutHistoryTab = ({ workouts }: WorkoutHistoryTabProps) => {
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("week");
  const [loading, setLoading] = useState<boolean>(true);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (workouts.length === 0) {
      return;
    }

    setLoading(true);

    const fetchWeeklyWorkouts = (): void => {
      const today = new Date();
      const currentYear = today.getFullYear();

      // Set start of the week to Sunday at 00:00
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Set end of the week to Saturday at 23:59
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      const weeklyWorkouts = workouts.filter((workout) => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0); // Also clear time for workout dates
        return (
          workoutDate >= startOfWeek &&
          workoutDate <= endOfWeek &&
          workoutDate.getFullYear() === currentYear
        );
      });

      setSelectedWorkouts(weeklyWorkouts);
      setLoading(false);
    };

    const fetchMonthlyWorkouts = (): void => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const monthlyWorkouts = workouts.filter((workout) => {
        const workoutDate = new Date(workout.date);
        return (
          workoutDate.getMonth() === currentMonth &&
          workoutDate.getFullYear() === currentYear
        );
      });

      setSelectedWorkouts(monthlyWorkouts);
      setLoading(false);
    };

    const fetchAllWorkouts = (): void => {
      setSelectedWorkouts(workouts);
      setLoading(false);
    };

    if (selectedTab === "week") fetchWeeklyWorkouts();
    else if (selectedTab === "month") fetchMonthlyWorkouts();
    else if (selectedTab === "all") fetchAllWorkouts();
  }, [workouts, selectedTab]);

  return (
    <View className="my-4">
      <View className="flex justify-center items-center">
        <View className="flex-row bg-base-300 shadow-md rounded-lg overflow-hidden p-1">
          <TouchableOpacity
            className={`px-4 py-3 rounded ${selectedTab === "week" ? "bg-primary text-white" : ""}`}
            onPress={() => setSelectedTab("week")}
          >
            <Text
              className={selectedTab === "week" ? "text-white" : "text-gray"}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-3 rounded ${selectedTab === "month" ? "bg-primary" : ""}`}
            onPress={() => setSelectedTab("month")}
          >
            <Text
              className={selectedTab === "month" ? "text-white" : "text-gray"}
            >
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-3 rounded ${selectedTab === "all" ? "bg-primary" : ""}`}
            onPress={() => setSelectedTab("all")}
          >
            <Text
              className={selectedTab === "all" ? "text-white" : "text-gray"}
            >
              All Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!loading && (
        <ScrollView
          className="mt-4"
          contentContainerStyle={{
            paddingBottom: insets.bottom + 200,
          }}
        >
          {selectedWorkouts.length > 0 ? (
            selectedWorkouts.map((workout) => (
              <WorkoutHistoryCard key={workout.id} workout={workout} />
            ))
          ) : (
            <View className="mt-4">
              <Text className="text-center text-base-content text-lg">
                {selectedTab === "week" && "No workouts this week."}
                {selectedTab === "month" && "No workouts this month."}
                {selectedTab === "all" && "No workouts yet."}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default WorkoutHistoryTab;
