import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutSchedule, ScheduledWorkout } from "../../lib/scheduleUtils";

type ScheduleCardProps = {
  scheduledWorkout: ScheduledWorkout;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
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
      const date = new Date(schedule.start_date);
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

export default function ScheduleCard({ scheduledWorkout }: ScheduleCardProps) {
  const { schedule, workout_name, workout_description } = scheduledWorkout;

  return (
    <View
      className="bg-base-200 rounded-xl p-4"
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
          <Text className="text-lg font-semibold text-base-content">
            {workout_name}
          </Text>
          {workout_description && (
            <Text className="text-sm text-muted mt-1">
              {workout_description}
            </Text>
          )}
        </View>
        <View
          className={`px-2 py-1 rounded-full ${
            schedule.is_active ? "bg-success/10" : "bg-base-300"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              schedule.is_active ? "text-success" : "text-muted"
            }`}
          >
            {schedule.is_active ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="repeat-outline" size={16} color="#9ca3af" />
          <Text className="text-sm text-muted">
            {formatRecurrence(schedule)}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
          <Text className="text-sm text-muted">
            {formatDateRange(schedule)}
          </Text>
        </View>
      </View>
    </View>
  );
}


