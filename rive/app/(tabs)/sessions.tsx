import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import SelectWorkoutModal from "../components/modals/SelectWorkoutModal";
import SessionFilters, {
  DateRangeFilter,
  StatusFilter,
  SortOrder,
} from "../components/sessions/SessionFilters";
import NextScheduledWorkout from "../components/sessions/NextScheduledWorkout";
import SessionCard from "../components/sessions/SessionCard";
import SessionEmptyState from "../components/sessions/SessionEmptyState";
import Header from "../components/Header";
import AppText from "../components/ui/AppText";
import AppButton from "../components/ui/AppButton";
import { Session } from "../components/sessions/types";

const ADD_SESSION_FAB_BOTTOM = 16;

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

  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fetchSessions = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
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

      const workoutIds = [
        ...new Set(
          rawSessionsData
            .map((session) => session.workout_id)
            .filter((id): id is string => id !== null),
        ),
      ];

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

      const workoutMap = new Map<string, string>();
      workoutsData?.forEach((workout) => {
        workoutMap.set(workout.id, workout.name);
      });

      const transformedSessions = rawSessionsData.map(
        (session: RawSession) => ({
          id: session.id,
          name: workoutMap.get(session.workout_id) || "Unknown Workout",
          started_at: session.started_at,
          ended_at: session.ended_at,
          completed: session.completed || false,
        }),
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

      router.push(`/session/${data.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  const availableWorkouts = Array.from(
    new Set(sessions.map((session) => session.name)),
  ).sort();

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

    if (selectedWorkout !== null) {
      filtered = filtered.filter((session) => session.name === selectedWorkout);
    }

    if (dateRange !== "all") {
      const bounds = getDateRangeBounds(dateRange);
      if (bounds) {
        filtered = filtered.filter((session) => {
          const sessionDate = new Date(session.started_at);
          return sessionDate >= bounds.start && sessionDate <= bounds.end;
        });
      }
    }

    if (statusFilter === "completed") {
      filtered = filtered.filter((session) => session.completed === true);
    } else if (statusFilter === "in_progress") {
      filtered = filtered.filter((session) => session.completed === false);
    }

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
      <View className="flex-1 bg-background dark:bg-background-dark">
        <Header />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#ff6fa1" : "#ff4b8c"}
          />
          <Text className="text-textMuted dark:text-textMuted-dark mt-2">
            Loading sessions...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <Header />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: ADD_SESSION_FAB_BOTTOM,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <AppText variant="header">Sessions</AppText>
          <AppText variant="caption" tone="muted" className="normal-case">
            Track your workout sessions
          </AppText>
        </View>

        <NextScheduledWorkout />

        <View className="h-px bg-border dark:bg-border-dark mb-6" />

        <View className="flex-row items-center justify-between gap-2 mb-4">
          <AppText variant="caption" tone="muted">
            Past activities
          </AppText>
          <View className="flex-row items-center gap-2 flex-1 justify-end">
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
              triggerVariant="compact"
            />
          </View>
        </View>

        {filteredSessions.length === 0 ? (
          <SessionEmptyState />
        ) : (
          <View className="gap-4 pb-2">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionSelect(session.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View
        className="absolute right-5 z-50"
        style={{ bottom: ADD_SESSION_FAB_BOTTOM }}
        pointerEvents="box-none"
      >
        <AppButton
          tone="primary"
          size="icon"
          onPress={handleNewSession}
          accessibilityLabel="Start new session"
          icon={<Ionicons name="add" size={28} color="#ffffff" />}
          className="shadow-md shadow-primary/40"
          style={{
            shadowColor: isDark ? "#ff6fa1" : "#ff4b8c",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 10,
          }}
        />
      </View>

      <SelectWorkoutModal
        isOpen={isSelectWorkoutModalOpen}
        onClose={() => setIsSelectWorkoutModalOpen(false)}
        onWorkoutSelect={handleWorkoutSelect}
        onNewTemplatePress={() => {
          setIsSelectWorkoutModalOpen(false);
          router.push("/(tabs)/workouts");
        }}
      />
    </View>
  );
}
