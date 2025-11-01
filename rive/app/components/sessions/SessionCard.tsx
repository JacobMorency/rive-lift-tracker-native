import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "./types";

type SessionCardProps = {
  session: Session;
  onPress: () => void;
};

const formatDuration = (startTime: string, endTime: string | null) => {
  if (!endTime) return "In Progress";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins}m`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};

const getWorkoutIcon = (workoutName: string) => {
  return "barbell-outline" as const;
};

export default function SessionCard({ session, onPress }: SessionCardProps) {
  return (
    <TouchableOpacity
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
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          {/* Workout Icon */}
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              session.completed ? "bg-success/20" : "bg-warning/20"
            }`}
          >
            <Ionicons
              name={getWorkoutIcon(session.name)}
              size={24}
              color={session.completed ? "#10b981" : "#f59e0b"}
            />
          </View>

          {/* Session Info */}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-base-content">
              {session.name}
            </Text>
            <View className="flex-row items-center gap-3 mt-1">
              <Text className="text-sm text-muted">
                {new Date(session.started_at).toLocaleDateString()}
              </Text>
              <Text className="text-sm text-muted">
                {formatDuration(session.started_at, session.ended_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status and Arrow */}
        <View className="flex-row items-center gap-3">
          <View
            className={`px-3 py-1 rounded-full ${
              session.completed ? "bg-success/10" : "bg-warning/10"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                session.completed ? "text-success" : "text-warning"
              }`}
            >
              {session.completed ? "Completed" : "In Progress"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

