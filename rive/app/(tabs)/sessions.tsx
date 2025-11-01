import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import SelectWorkoutModal from "../components/selectworkoutmodal";
import SessionList from "../components/sessions/SessionList";
import SessionFilters, {
  DateRangeFilter,
  StatusFilter,
  SortOrder,
} from "../components/sessions/SessionFilters";
import Header from "../components/header";

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

  // Filter state
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const { user, userData } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchSessions = useCallback(async (): Promise<void> => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

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

  // Extract unique workout names from sessions
  const availableWorkouts = Array.from(
    new Set(sessions.map((session) => session.name))
  ).sort();

  // Filter logic
  const getDateRangeBounds = (range: DateRangeFilter) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    switch (range) {
      case "week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return { start: startOfWeek, end: today };
      }
      case "month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return { start: startOfMonth, end: today };
      }
      case "year": {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        return { start: startOfYear, end: today };
      }
      default:
        return null;
    }
  };

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Filter by workout
    if (selectedWorkout !== null) {
      filtered = filtered.filter((session) => session.name === selectedWorkout);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const bounds = getDateRangeBounds(dateRange);
      if (bounds) {
        filtered = filtered.filter((session) => {
          const sessionDate = new Date(session.started_at);
          return sessionDate >= bounds.start && sessionDate <= bounds.end;
        });
      }
    }

    // Filter by status
    if (statusFilter === "completed") {
      filtered = filtered.filter((session) => session.completed === true);
    } else if (statusFilter === "in_progress") {
      filtered = filtered.filter((session) => session.completed === false);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.started_at).getTime();
      const dateB = new Date(b.started_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [sessions, selectedWorkout, dateRange, statusFilter, sortOrder]);

  const handleClearAllFilters = () => {
    setSelectedWorkout(null);
    setDateRange("all");
    setStatusFilter("all");
    setSortOrder("newest");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-base-100">
        <Header
          title="Sessions"
          subtitle={userData ? "Track your workout sessions" : undefined}
        />

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
      <Header
        title="Sessions"
        subtitle={userData ? "Track your workout sessions" : undefined}
      />

      {/* Sessions List with FlatList */}
      <SessionList
        sessions={filteredSessions}
        onSessionSelect={handleSessionSelect}
        ListHeaderComponent={() => (
          <>
            {/* Session List Title */}
            <View className="px-4 pt-4 pb-2">
              <Text className="text-2xl font-bold text-base-content">
                Session List
              </Text>
            </View>

            {/* Session Filters */}
            <SessionFilters
              availableWorkouts={availableWorkouts}
              selectedWorkout={selectedWorkout}
              dateRange={dateRange}
              statusFilter={statusFilter}
              sortOrder={sortOrder}
              onWorkoutChange={setSelectedWorkout}
              onDateRangeChange={setDateRange}
              onStatusChange={setStatusFilter}
              onSortOrderChange={setSortOrder}
              onClearAll={handleClearAllFilters}
            />
          </>
        )}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
      />

      {/* Fixed Start New Session Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-base-100"
        style={{
          paddingBottom: insets.bottom,
          paddingTop: 12,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.1)",
        }}
      >
        <TouchableOpacity
          className="w-full py-4 rounded-xl bg-primary flex-row items-center justify-center"
          onPress={handleNewSession}
          style={{
            shadowColor: "#ff4b8c",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="fitness" size={24} color="#ffffff" />
          <Text className="text-primary-content text-center font-bold ml-3 text-lg">
            Start New Session
          </Text>
        </TouchableOpacity>
      </View>

      {/* Select Workout Modal */}
      <SelectWorkoutModal
        isOpen={isSelectWorkoutModalOpen}
        onClose={() => setIsSelectWorkoutModalOpen(false)}
        onWorkoutSelect={handleWorkoutSelect}
      />
    </View>
  );
}
