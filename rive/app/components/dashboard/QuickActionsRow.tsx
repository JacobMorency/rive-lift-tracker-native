import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScheduledWorkoutWithDate } from "../../lib/scheduleUtils";
import AppText from "../ui/AppText";
import AppCard from "../ui/AppCard";

type QuickActionsRowProps = {
  onStartSession: (workoutId?: string) => void;
  scheduledWorkout?: ScheduledWorkoutWithDate | null;
};

export default function QuickActionsRow({
  onStartSession,
  scheduledWorkout,
}: QuickActionsRowProps) {
  const router = useRouter();

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
    <View className="mb-6">
      <View className="gap-3">
        <View className="flex-row gap-3">
          <AppCard
            className="flex-1"
            onPress={() => router.push("/schedule")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="w-10 h-10  rounded-lg items-center justify-center mb-2">
                <Ionicons name="calendar-outline" size={24} color="#a1a1aa" />
              </View>
              <AppText variant="caption" tone="muted" className="text-center">
                Schedule
              </AppText>
            </View>
          </AppCard>

          <AppCard
            className="flex-1"
            onPress={() => router.push("/(tabs)/stats")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="w-10 h-10  rounded-lg items-center justify-center mb-2">
                <Ionicons name="analytics-outline" size={24} color="#a1a1aa" />
              </View>
              <AppText variant="caption" tone="muted" className="text-center">
                Stats
              </AppText>
            </View>
          </AppCard>

          <AppCard
            className="flex-1"
            onPress={() => router.push("/(tabs)/sessions")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="w-10 h-10  rounded-lg items-center justify-center mb-2">
                <Ionicons name="barbell-outline" size={24} color="#a1a1aa" />
              </View>
              <AppText variant="caption" tone="muted" className="text-center">
                Sessions
              </AppText>
            </View>
          </AppCard>
        </View>
      </View>
    </View>
  );
}
