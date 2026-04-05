import React from "react";
import { View } from "react-native";
import AppText from "../ui/AppText";

type SessionOverviewSectionProps = {
  workoutName: string;
  startedAt: string;
  completedCount: number;
  totalExercises: number;
};

export default function SessionOverviewSection({
  workoutName,
  startedAt,
  completedCount,
  totalExercises,
}: SessionOverviewSectionProps) {
  const pct = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
  const dateLabel = `Started on ${new Date(startedAt).toLocaleDateString()}`;

  return (
    <View>
      <View className="mb-4">
        <AppText variant="caption" tone="muted">
          Current Session
        </AppText>
        <View className="flex-row justify-between items-stretch my-2">
          <View className="flex-1 justify-between">
            <AppText
              variant="header"
              tone="default"
              className="font-extrabold tracking-tight leading-none"
              numberOfLines={2}
            >
              {workoutName}
            </AppText>
            <AppText variant="body" tone="muted" className="text-sm">
              {dateLabel}
            </AppText>
          </View>
          <View className="justify-between items-end">
            <AppText variant="header" tone="primary" className="font-bold">
              {completedCount}/{totalExercises}
            </AppText>
            <AppText variant="caption" tone="muted">
              Exercises
            </AppText>
          </View>
        </View>
      </View>

      <View className="h-1 w-full bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-full overflow-hidden">
        <View
          className="h-full bg-primary dark:bg-primary-dark rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}
