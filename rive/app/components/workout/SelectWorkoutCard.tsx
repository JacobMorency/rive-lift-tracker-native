import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../ui/AppCard";
import AppText from "../ui/AppText";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercise_count: number;
};

type SelectWorkoutCardProps = {
  workout: WorkoutTemplate;
  onPress: () => void;
  /** Default template tile; compact row for extra same-day scheduled items */
  layoutVariant?: "template" | "compactScheduled";
};

const NEW_TEMPLATE_DAYS = 7;

function formatRelativeCreated(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isNewTemplate(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < NEW_TEMPLATE_DAYS * 86400000;
}

export default function SelectWorkoutCard({
  workout,
  onPress,
  layoutVariant = "template",
}: SelectWorkoutCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";
  const isNew = isNewTemplate(workout.created_at);
  const relativeDate = formatRelativeCreated(workout.created_at);

  if (layoutVariant === "compactScheduled") {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className="flex-row items-center gap-3 rounded-ds-card border border-primary/15 dark:border-primary-dark/25 bg-surface dark:bg-surface-dark px-4 py-3 mb-3"
      >
        <View className="w-10 h-10 rounded-ds-tag bg-primary/10 dark:bg-primary-dark/15 items-center justify-center">
          <Ionicons name="calendar-outline" size={20} color={primaryIcon} />
        </View>
        <View className="flex-1 min-w-0">
          <AppText variant="body" className="font-bold">
            {workout.name}
          </AppText>
          <AppText
            variant="caption"
            tone="muted"
            className="normal-case mt-0.5"
          >
            {workout.exercise_count}{" "}
            {workout.exercise_count === 1 ? "exercise" : "exercises"} · Also
            today
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
      <AppCard
        className="border border-border dark:border-border-dark mb-0"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View className="gap-4">
          <View className="flex-row justify-between items-start">
            <AppCard surface="alt" radius="tag" className="!p-3">
              <Ionicons name="barbell-outline" size={22} color={primaryIcon} />
            </AppCard>
            {isNew ? (
              <View className="rounded bg-primary/10 dark:bg-primary-dark/15 px-2 py-1">
                <AppText
                  variant="caption"
                  tone="primary"
                  className="text-[10px] font-bold normal-case tracking-widest"
                >
                  New
                </AppText>
              </View>
            ) : (
              <View className="rounded bg-surfaceAlt dark:bg-surfaceAlt-dark px-2 py-1">
                <AppText
                  variant="caption"
                  tone="muted"
                  className="text-[10px] font-bold normal-case tracking-widest"
                >
                  {relativeDate}
                </AppText>
              </View>
            )}
          </View>

          <View>
            <AppText variant="body" className="font-bold tracking-tight">
              {workout.name}
            </AppText>
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="list-outline"
                  size={14}
                  color={isDark ? "#a1a1aa" : "#6b7280"}
                />
                <AppText variant="caption" tone="muted" className="normal-case">
                  {workout.exercise_count}{" "}
                  {workout.exercise_count === 1 ? "exercise" : "exercises"}
                </AppText>
              </View>
              <View className="h-1 w-1 rounded-full bg-border dark:bg-border-dark" />
              <AppText variant="caption" tone="muted" className="normal-case">
                Tap to start
              </AppText>
            </View>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}
