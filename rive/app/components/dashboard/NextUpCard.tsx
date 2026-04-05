import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScheduledWorkoutWithDate } from "../../lib/scheduleUtils";
import AppCard from "../ui/AppCard";
import AppText from "../ui/AppText";
import AppButton from "../ui/AppButton";

type NextUpCardProps = {
  nextScheduledWorkout: ScheduledWorkoutWithDate | null;
  onStartSession: (workoutId?: string) => void;
};

export default function NextUpCard({
  nextScheduledWorkout,
  onStartSession,
}: NextUpCardProps) {
  const formatSubtitle = () => {
    if (!nextScheduledWorkout) {
      return "No workout scheduled • Tap to start";
    }

    const [year, month, day] = nextScheduledWorkout.scheduledDate
      .split("-")
      .map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (date.getTime() === today.getTime()) {
      label = "Today";
    } else if (date.getTime() === tomorrow.getTime()) {
      label = "Tomorrow";
    }

    return `${label} • ${nextScheduledWorkout.workout_name}`;
  };

  const handlePress = () => {
    if (nextScheduledWorkout) {
      onStartSession(nextScheduledWorkout.schedule.workout_id);
    } else {
      onStartSession();
    }
  };

  return (
    <AppCard
      radius="large"
      className="mb-6 p-6"
      onPress={handlePress}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <AppText variant="caption" tone="primary" className="mb-1">
            Next Up
          </AppText>
          <AppText variant="subheader" tone="default" className="mb-1">
            {nextScheduledWorkout ? "Start Session" : "Start Workout"}
          </AppText>
          <AppText variant="caption" tone="muted" className="normal-case">
            {formatSubtitle()}
          </AppText>
        </View>

        <AppButton
          tone="primary"
          size="icon"
          onPress={handlePress}
          icon={<Ionicons name="play" size={26} color="#000000" />}
          className="shadow-md shadow-primary/50"
        />
      </View>
    </AppCard>
  );
}
