import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScheduledWorkoutWithDate } from "../../lib/scheduleUtils";

type QuickActionsProps = {
  onStartSession: (workoutId?: string) => void;
  scheduledWorkout?: ScheduledWorkoutWithDate | null;
};

export default function QuickActions({
  onStartSession,
  scheduledWorkout,
}: QuickActionsProps) {
  const router = useRouter();

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

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
        Quick Actions
      </Text>
      <View className="gap-3">
        {/* Primary Action - Start Session or Scheduled Workout */}
        {scheduledWorkout ? (
          <TouchableOpacity
            className="bg-[#ff4b8c] dark:bg-[#ff6fa1] rounded-xl p-5"
            onPress={() =>
              onStartSession(scheduledWorkout.schedule.workout_id)
            }
            style={{
              shadowColor: "#ff4b8c",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <Ionicons name="play-circle" size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  Start {scheduledWorkout.workout_name}
                </Text>
                <Text className="text-white/80 text-sm mt-0.5">
                  {formatDate(scheduledWorkout.scheduledDate)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-[#ff4b8c] dark:bg-[#ff6fa1] rounded-xl p-5"
            onPress={() => onStartSession()}
            style={{
              shadowColor: "#ff4b8c",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <Ionicons name="play-circle" size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  Start Session
                </Text>
                <Text className="text-white/80 text-sm mt-0.5">
                  Begin a new workout
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}

        {/* Secondary Actions Grid */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-4"
            onPress={() => router.push("/schedule")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="w-10 h-10 bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 rounded-lg items-center justify-center mb-2">
                <Ionicons name="calendar-outline" size={20} color="#ff4b8c" />
              </View>
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white text-center">
                Schedule
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-4"
            onPress={() => router.push("/(tabs)/stats")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="w-10 h-10 bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 rounded-lg items-center justify-center mb-2">
                <Ionicons name="analytics-outline" size={20} color="#ff4b8c" />
              </View>
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white text-center">
                Stats
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-4"
            onPress={() => router.push("/(tabs)/sessions")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="w-10 h-10 bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 rounded-lg items-center justify-center mb-2">
                <Ionicons name="barbell-outline" size={20} color="#ff4b8c" />
              </View>
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white text-center">
                Sessions
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

