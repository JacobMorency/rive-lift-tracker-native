import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutSchedule, ScheduledWorkout } from "../../lib/scheduleUtils";
import AppCard from "../ui/AppCard";
import AppText from "../ui/AppText";

type ScheduleCardProps = {
  scheduledWorkout: ScheduledWorkout;
  onEdit?: (scheduledWorkout: ScheduledWorkout) => void;
  onDelete?: (scheduleId: string) => void;
};

// Helper function to parse YYYY-MM-DD date string as local date (not UTC)
// This prevents timezone issues where dates can appear a day behind
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatRecurrence = (schedule: WorkoutSchedule): string => {
  switch (schedule.recurrence_type) {
    case "once":
      return `Once on ${formatDate(schedule.start_date)}`;

    case "daily":
      return "Daily";

    case "weekly": {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = schedule.recurrence_days
        .sort((a, b) => a - b)
        .map((d) => dayNames[d])
        .join(", ");
      return `Weekly on ${days}`;
    }

    case "monthly": {
      const date = parseLocalDate(schedule.start_date);
      const dayOfMonth = date.getDate();
      const suffix =
        dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31
          ? "st"
          : dayOfMonth === 2 || dayOfMonth === 22
            ? "nd"
            : dayOfMonth === 3 || dayOfMonth === 23
              ? "rd"
              : "th";
      return `Monthly on the ${dayOfMonth}${suffix}`;
    }

    case "monthly_date": {
      const dates = schedule.recurrence_days
        .sort((a, b) => a - b)
        .map((d) => {
          const suffix =
            d === 1 || d === 21 || d === 31
              ? "st"
              : d === 2 || d === 22
                ? "nd"
                : d === 3 || d === 23
                  ? "rd"
                  : "th";
          return `${d}${suffix}`;
        })
        .join(", ");
      return `Monthly on the ${dates}`;
    }

    default:
      return "Unknown";
  }
};

const formatDateRange = (schedule: WorkoutSchedule): string => {
  const startDate = formatDate(schedule.start_date);

  if (!schedule.end_date) {
    return `${startDate} - Ongoing`;
  }

  const endDate = formatDate(schedule.end_date);
  return `${startDate} - ${endDate}`;
};

export default function ScheduleCard({
  scheduledWorkout,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";

  const { schedule, workout_name, workout_description } = scheduledWorkout;

  return (
    <AppCard
      className={`border ${
        schedule.is_active
          ? "border-primary/15 dark:border-primary-dark/25"
          : "border-border dark:border-border-dark"
      }`}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <AppText variant="subheader" className="font-semibold">
            {workout_name}
          </AppText>
          {workout_description ? (
            <AppText
              variant="body"
              tone="muted"
              className="mt-1 normal-case"
            >
              {workout_description}
            </AppText>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1">
          <View
            className={`rounded-ds-tag px-2 py-1 ${
              schedule.is_active
                ? "bg-primary/10 dark:bg-primary-dark/15"
                : "bg-surfaceAlt dark:bg-surfaceAlt-dark"
            }`}
          >
            <AppText
              variant="caption"
              className="normal-case"
              tone={schedule.is_active ? "primary" : "muted"}
            >
              {schedule.is_active ? "Active" : "Inactive"}
            </AppText>
          </View>
          {onEdit ? (
            <TouchableOpacity
              onPress={() => onEdit(scheduledWorkout)}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Edit schedule"
            >
              <Ionicons name="pencil-outline" size={20} color={primaryIcon} />
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity
              onPress={() => onDelete(schedule.id)}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Delete schedule"
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="repeat-outline" size={16} color="#9ca3af" />
          <AppText variant="body" tone="muted" className="flex-1 normal-case">
            {formatRecurrence(schedule)}
          </AppText>
        </View>

        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
          <AppText variant="body" tone="muted" className="flex-1 normal-case">
            {formatDateRange(schedule)}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}
