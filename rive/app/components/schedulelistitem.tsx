import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import { ScheduledWorkout, deleteSchedule } from "../lib/scheduleUtils";

type ScheduleListItemProps = {
  scheduledWorkout: ScheduledWorkout;
  onScheduleDeleted?: () => void;
  onEdit?: (schedule: ScheduledWorkout) => void;
};

export default function ScheduleListItem({
  scheduledWorkout,
  onScheduleDeleted,
  onEdit,
}: ScheduleListItemProps) {
  const { user } = useAuth();
  const router = useRouter();

  const formatRecurrenceText = () => {
    const { schedule } = scheduledWorkout;

    switch (schedule.recurrence_type) {
      case "once":
        return "One time";
      case "daily":
        return "Daily";
      case "weekly":
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const selectedDays = schedule.recurrence_days
          .map((day) => dayNames[day])
          .join(", ");
        return `Weekly (${selectedDays})`;
      case "monthly":
        return "Monthly (same day)";
      case "monthly_date":
        const dates = schedule.recurrence_days.sort((a, b) => a - b).join(", ");
        return `Monthly (${dates})`;
      default:
        return "Unknown";
    }
  };

  const handleStartSession = async () => {
    if (!user) return;

    try {
      // Create a new session
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([
          {
            user_id: user.id,
            workout_id: scheduledWorkout.schedule.workout_id,
            started_at: new Date().toISOString(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
        Alert.alert("Error", "Failed to start session");
        return;
      }

      // Navigate to the session detail page
      router.push(`/session/${data.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      Alert.alert("Error", "Failed to start session");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Schedule",
      "Are you sure you want to delete this workout schedule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteSchedule(scheduledWorkout.schedule.id);
            if (success) {
              onScheduleDeleted?.();
            } else {
              Alert.alert("Error", "Failed to delete schedule");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    onEdit?.(scheduledWorkout);
  };

  return (
    <View className="bg-base-200 rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-base-content mb-1">
            {scheduledWorkout.workout_name}
          </Text>
          {scheduledWorkout.workout_description && (
            <Text className="text-muted text-sm mb-2">
              {scheduledWorkout.workout_description}
            </Text>
          )}
          <View className="flex-row items-center">
            <Ionicons name="repeat-outline" size={14} color="#6b7280" />
            <Text className="text-muted text-sm ml-1">
              {formatRecurrenceText()}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-base-300 items-center justify-center"
            onPress={handleEdit}
          >
            <Ionicons name="pencil-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-base-300 items-center justify-center"
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary rounded-lg p-3 flex-row items-center justify-center"
        onPress={handleStartSession}
      >
        <Ionicons name="play-circle" size={20} color="#ffffff" />
        <Text className="text-primary-content font-semibold ml-2">
          Start Session
        </Text>
      </TouchableOpacity>
    </View>
  );
}
