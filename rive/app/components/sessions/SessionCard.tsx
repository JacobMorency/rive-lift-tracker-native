import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "./types";
import Card from "../ui/Card";

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

export default function SessionCard({ session, onPress }: SessionCardProps) {
  const isCompleted = session.completed;
  const statusColor = isCompleted ? "#10b981" : "#f59e0b";
  const statusBgColor = isCompleted ? "bg-[#10b981]/10" : "bg-[#f59e0b]/10";
  const statusTextColor = isCompleted ? "text-[#10b981]" : "text-[#f59e0b]";
  const iconBgColor = isCompleted ? "bg-[#10b981]/20" : "bg-[#f59e0b]/20";

  return (
    <Card variant="elevated" onPress={onPress}>
      <View className="gap-3">
        {/* Header Row */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            {/* Workout Icon */}
            <View
              className={`w-12 h-12 rounded-xl items-center justify-center ${iconBgColor}`}
            >
              <Ionicons name="barbell-outline" size={24} color={statusColor} />
            </View>

            {/* Session Info */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-zinc-900 dark:text-white">
                {session.name}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>

        {/* Metadata Row */}
        <View className="flex-row flex-wrap items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(session.started_at).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {formatDuration(session.started_at, session.ended_at)}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusBgColor}`}>
            <Text className={`text-xs font-medium ${statusTextColor}`}>
              {isCompleted ? "Completed" : "In Progress"}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

