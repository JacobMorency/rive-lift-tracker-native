import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "./types";
import SessionCard from "./SessionCard";

type SessionListProps = {
  sessions: Session[];
  selectedTab: string;
  onSessionSelect: (sessionId: string) => void;
};

export default function SessionList({
  sessions,
  selectedTab,
  onSessionSelect,
}: SessionListProps) {
  return (
    <View className="px-4">
      {sessions.length > 0 ? (
        <View className="gap-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => onSessionSelect(session.id)}
            />
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-12">
          <View className="items-center">
            <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
              <Ionicons name="fitness-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-base-content mb-2">
              No Sessions Yet
            </Text>
            <Text className="text-center text-muted mb-6 max-w-xs">
              {selectedTab === "week" &&
                "Start your week strong with a new workout session!"}
              {selectedTab === "month" &&
                "Ready to make this month count? Start a new session!"}
              {selectedTab === "all" &&
                "Ready to begin your fitness journey? Let's start with your first session!"}
            </Text>
            <View className="flex-row items-center gap-2">
              <Ionicons name="arrow-up" size={16} color="#ff4b8c" />
              <Text className="text-sm font-medium text-primary">
                Tap "Start New Session" above
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

