import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type QuickActionsProps = {
  onStartSession: () => void;
};

export default function QuickActions({ onStartSession }: QuickActionsProps) {
  const router = useRouter();

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-base-content mb-3">
        Quick Actions
      </Text>
      <View className="gap-3">
        {/* Primary Action - Start Session */}
        <TouchableOpacity
          className="bg-primary rounded-xl p-5"
          onPress={onStartSession}
          style={{
            shadowColor: "#ff4b8c",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-primary-content/20 rounded-xl items-center justify-center">
              <Ionicons name="play-circle" size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-primary-content font-bold text-lg">
                Start Session
              </Text>
              <Text className="text-primary-content/80 text-sm mt-0.5">
                Begin a new workout
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* Secondary Actions Grid */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-base-200 rounded-xl p-4"
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
              <View className="w-10 h-10 bg-primary/20 rounded-lg items-center justify-center mb-2">
                <Ionicons name="calendar-outline" size={20} color="#ff4b8c" />
              </View>
              <Text className="text-sm font-semibold text-base-content text-center">
                Schedule
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-base-200 rounded-xl p-4"
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
              <View className="w-10 h-10 bg-primary/20 rounded-lg items-center justify-center mb-2">
                <Ionicons name="analytics-outline" size={20} color="#ff4b8c" />
              </View>
              <Text className="text-sm font-semibold text-base-content text-center">
                Stats
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-base-200 rounded-xl p-4"
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
              <View className="w-10 h-10 bg-primary/20 rounded-lg items-center justify-center mb-2">
                <Ionicons name="barbell-outline" size={20} color="#ff4b8c" />
              </View>
              <Text className="text-sm font-semibold text-base-content text-center">
                Sessions
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

