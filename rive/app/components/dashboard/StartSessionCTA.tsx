import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { ScheduledWorkoutWithDate } from "../../lib/scheduleUtils";

type StartSessionCTAProps = {
  onStartSession: (workoutId?: string) => void;
  scheduledWorkout?: ScheduledWorkoutWithDate | null;
};

export default function StartSessionCTA({
  onStartSession,
  scheduledWorkout,
}: StartSessionCTAProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
    <View
      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900"
      style={{
        paddingBottom: insets.bottom,
        paddingTop: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
      }}
    >
      <TouchableOpacity
        className={`w-full py-4 rounded-xl ${
          isDark ? "bg-[#ff6fa1]" : "bg-[#ff4b8c]"
        } flex-row items-center justify-center`}
        onPress={() => onStartSession(scheduledWorkout?.schedule.workout_id)}
        activeOpacity={0.8}
        style={{
          shadowColor: isDark ? "#ff6fa1" : "#ff4b8c",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="fitness" size={24} color="#ffffff" />
        <Text className="text-white text-center font-bold ml-3 text-lg">
          {scheduledWorkout
            ? `Start ${scheduledWorkout.workout_name}`
            : "Start New Session"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
