import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import SessionList from "../components/sessions/SessionList";
import SessionFilters, {
  DateRangeFilter,
  StatusFilter,
  SortOrder,
} from "../components/sessions/SessionFilters";
import UpcomingWorkouts from "../components/sessions/UpcomingWorkouts";
import NextScheduledWorkout from "../components/sessions/NextScheduledWorkout";
import Header from "../components/header";
import SectionHeader from "../components/ui/SectionHeader";

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
  workout_id: string | null;
  name?: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      // First query: Get sessions (including name)
      const { data: rawSessionsData, error: sessionsError } = await supabase
        .from("workout_sessions")
        .select("id, started_at, ended_at, completed, workout_id, name")
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

      // Get unique workout IDs (filter out null values) for backward compatibility
      const workoutIds = [
        ...new Set(
          rawSessionsData
            .map((session) => session.workout_id)
            .filter((id): id is string => id !== null)
        ),
      ];

      // Only query workouts if we have valid IDs (for backward compatibility)
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

      // Create a map of workout IDs to names (for backward compatibility)
      const workoutMap = new Map<string, string>();
      workoutsData?.forEach((workout) => {
        workoutMap.set(workout.id, workout.name);
      });

      // Transform the data - use session.name if available, otherwise workout.name
      const transformedSessions = rawSessionsData.map(
        (session: RawSession & { name?: string }) => ({
          id: session.id,
          name:
            session.name ||
            (session.workout_id ? workoutMap.get(session.workout_id) : null) ||
            new Date(session.started_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          started_at: session.started_at,
          ended_at: session.ended_at,
          completed: session.completed || false,
          workout_id: session.workout_id || null,
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

  // Future: Add "Repeat Session" functionality
  // This would allow users to duplicate a completed session
  // const handleRepeatSession = async (sessionId: string) => { ... };

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
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <Header
          title="Sessions"
          subtitle={userData ? "Track your workout sessions" : undefined}
        />

        {/* Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">
            Loading sessions...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-zinc-900">
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
            {/* Next Scheduled Workout */}
            <View className="px-4 pt-6">
              <NextScheduledWorkout />
            </View>

            {/* Section Divider */}
            <View className="h-px bg-gray-200 dark:bg-zinc-700 my-6 mx-4" />

            {/* Sessions Section */}
            <View className="px-4">
              <SectionHeader
                icon="barbell-outline"
                title="Sessions"
                badge={
                  filteredSessions.length > 0
                    ? filteredSessions.length
                    : undefined
                }
                action={{
                  label: "View Schedule",
                  onPress: () => router.push("/schedule"),
                }}
              />

              {/* Upcoming Workouts */}
              {/* Feature flag: Set to true to show upcoming workouts */}
              {false && <UpcomingWorkouts />}

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
            </View>
          </>
        )}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
      />
    </View>
  );
}
