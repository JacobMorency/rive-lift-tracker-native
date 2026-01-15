import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutSchedule, ScheduledWorkout } from "../../lib/scheduleUtils";

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
  const { schedule, workout_name, workout_description } = scheduledWorkout;

  return (
    <View
      className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4"
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
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
            {workout_name}
          </Text>
          {workout_description && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {workout_description}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className={`px-2 py-1 rounded-full ${
              schedule.is_active ? "bg-success/10" : "bg-gray-100 dark:bg-zinc-700"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                schedule.is_active ? "text-success" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {schedule.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(scheduledWorkout)}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil-outline" size={20} color="#ff4b8c" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(schedule.id)}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="repeat-outline" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {formatRecurrence(schedule)}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {formatDateRange(schedule)}
          </Text>
        </View>
      </View>
    </View>
  );
}
