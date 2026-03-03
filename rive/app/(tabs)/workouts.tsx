import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/header";
import Card from "../components/ui/Card";

// Utility function to format date as "Mon DD, YYYY"
const formatSessionDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type IncompleteSession = {
  id: string;
  name: string;
  started_at: string;
};

export default function DashboardPage() {
  const [incompleteSession, setIncompleteSession] = useState<IncompleteSession | null>(null);
  const { user, userData } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Check for incomplete session
  const checkIncompleteSession = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("id, name, started_at")
        .eq("user_id", user.id)
        .eq("completed", false)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking incomplete session:", error);
        return;
      }

      if (data) {
        setIncompleteSession({
          id: data.id,
          name: data.name,
          started_at: data.started_at,
        });
      } else {
        setIncompleteSession(null);
      }
    } catch (error) {
      console.error("Error checking incomplete session:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkIncompleteSession();
    }
  }, [user, checkIncompleteSession]);

  const handleStartSession = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const sessionName = formatSessionDate(now);

      // Create a new session without workout_id
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([
          {
            user_id: user.id,
            workout_id: null,
            name: sessionName,
            started_at: now.toISOString(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error.message);
        return;
      }

      // Navigate to the session detail page
      router.push(`/session/${data.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleResumeSession = () => {
    if (incompleteSession) {
      router.push(`/session/${incompleteSession.id}`);
    }
  };

  const handleViewPastSessions = () => {
    router.push("/(tabs)/sessions");
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <View className="flex-1 bg-white dark:bg-zinc-900">
      <Header
        title="Home"
        subtitle={
          userData ? `Welcome back, ${userData.first_name}! 💪` : undefined
        }
      />

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Incomplete Session Card */}
        {incompleteSession && (
          <Card
            variant="elevated"
            onPress={handleResumeSession}
            className="mb-4"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-warning/20 items-center justify-center">
                <Ionicons name="time-outline" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                  {incompleteSession.name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Started {formatTimeAgo(incompleteSession.started_at)}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-[#ff4b8c] font-semibold">Resume</Text>
                <Ionicons name="chevron-forward" size={20} color="#ff4b8c" />
              </View>
            </View>
          </Card>
        )}

        {/* Past Sessions Button */}
        <TouchableOpacity
          className="w-full py-4 rounded-xl bg-gray-100 dark:bg-zinc-800 flex-row items-center justify-center mb-6"
          onPress={handleViewPastSessions}
          activeOpacity={0.7}
        >
          <Ionicons name="list" size={20} color="#6b7280" />
          <Text className="text-gray-600 dark:text-gray-400 font-semibold ml-2">
            View Past Sessions
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Bottom CTA: Start New Session */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900"
        style={{
          paddingBottom: insets.bottom,
          paddingTop: 12,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.1)",
        }}
      >
        <TouchableOpacity
          className="w-full py-4 rounded-xl bg-[#ff4b8c] dark:bg-[#ff6fa1] flex-row items-center justify-center"
          onPress={handleStartSession}
          activeOpacity={0.8}
          style={{
            shadowColor: "#ff4b8c",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="fitness" size={24} color="#ffffff" />
          <Text className="text-white text-center font-bold ml-3 text-lg">
            Start New Session
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
