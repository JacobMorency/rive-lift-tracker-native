import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import SelectWorkoutModal from "../components/selectworkoutmodal";
import SessionTabs from "../components/sessiontabs";

type Session = {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
};

type RawSession = {
  id: string;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  workout_id: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSelectWorkoutModalOpen, setIsSelectWorkoutModalOpen] =
    useState(false);
  const { user, userData } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      // First query: Get sessions
      const { data: rawSessionsData, error: sessionsError } = await supabase
        .from("workout_sessions")
        .select("id, started_at, ended_at, completed, workout_id")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError.message);
        return;
      }

      if (!rawSessionsData || rawSessionsData.length === 0) {
        setSessions([]);
        return;
      }

      // Get unique workout IDs (filter out null values)
      const workoutIds = [
        ...new Set(
          rawSessionsData
            .map((session) => session.workout_id)
            .filter((id): id is string => id !== null)
        ),
      ];

      // Only query workouts if we have valid IDs
      let workoutsData = null;
      if (workoutIds.length > 0) {
        const { data, error: workoutsError } = await supabase
          .from("workouts")
          .select("id, name")
          .in("id", workoutIds);

        if (workoutsError) {
          console.error("Error fetching workouts:", workoutsError.message);
          return;
        }
        workoutsData = data;
      }

      // Create a map of workout IDs to names
      const workoutMap = new Map<string, string>();
      workoutsData?.forEach((workout) => {
        workoutMap.set(workout.id, workout.name);
      });

      // Transform the data
      const transformedSessions = rawSessionsData.map(
        (session: RawSession) => ({
          id: session.id,
          name: workoutMap.get(session.workout_id) || "Unknown Workout",
          started_at: session.started_at,
          ended_at: session.ended_at,
          completed: session.completed || false,
        })
      );

      setSessions(transformedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setIsSelectWorkoutModalOpen(true);
  };

  const handleWorkoutSelect = async (workoutId: string) => {
    if (!user) return;

    try {
      // Create a new session
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([
          {
            user_id: user.id,
            workout_id: workoutId,
            started_at: new Date().toISOString(),
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

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-base-100">
        {/* Header */}
        <View
          className="bg-base-200 px-4 border-b border-base-300"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <Text className="text-2xl font-bold text-base-content">Sessions</Text>
          {userData && (
            <Text className="text-muted mt-1">Track your workout sessions</Text>
          )}
        </View>

        {/* Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <Text className="text-muted mt-2">Loading sessions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-base-100">
      {/* Header */}
      <View
        className="bg-base-200 px-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <Text className="text-2xl font-bold text-base-content">Sessions</Text>
        {userData && (
          <Text className="text-muted mt-1">Track your workout sessions</Text>
        )}
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        {/* New Session Button */}
        <View className="px-4 py-4">
          <TouchableOpacity
            className="w-full py-3 rounded-lg bg-primary"
            onPress={handleNewSession}
          >
            <Text className="text-primary-content text-center font-medium">
              ➕ New Session
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sessions List */}
        <SessionTabs
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
        />
      </ScrollView>

      {/* Select Workout Modal */}
      <SelectWorkoutModal
        isOpen={isSelectWorkoutModalOpen}
        onClose={() => setIsSelectWorkoutModalOpen(false)}
        onWorkoutSelect={handleWorkoutSelect}
      />
    </View>
  );
}
