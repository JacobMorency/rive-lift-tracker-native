import { supabase } from "./supabaseClient";

export type Timeframe = "week" | "month" | "year" | "all";

export type ExerciseSet = {
  id: string;
  reps: number | null;
  weight: number | null;
  partial_reps: number | null;
  is_unilateral?: boolean;
  left_reps?: number | null;
  right_reps?: number | null;
  created_at: string;
};

export type PersonalRecord = {
  exercise_id: number;
  exercise_name: string;
  category: string;
  max_weight: number;
  max_reps: number;
  max_volume: number;
  date_achieved: string;
  session_id: string;
};

export type SessionStats = {
  id: string;
  workout_name: string;
  started_at: string;
  ended_at: string | null;
  total_volume: number;
  total_sets: number;
  exercises_completed: number;
};

export type UserStats = {
  total_sessions: number;
  total_volume: number;
  workout_streak: number;
  active_days_this_month: number;
  personal_records: PersonalRecord[];
  recent_sessions: SessionStats[];
};

/**
 * Calculate total volume (weight × reps) for a set
 */
export const calculateSetVolume = (set: ExerciseSet): number => {
  if (!set.weight || !set.reps) return 0;

  if (set.is_unilateral) {
    const leftReps = set.left_reps || 0;
    const rightReps = set.right_reps || 0;
    return set.weight * (leftReps + rightReps);
  }

  return set.weight * set.reps;
};

/**
 * Calculate total volume across all sets
 */
export const calculateTotalVolume = (sets: ExerciseSet[]): number => {
  return sets.reduce((total, set) => total + calculateSetVolume(set), 0);
};

/**
 * Get date range for timeframe
 */
export const getDateRange = (
  timeframe: Timeframe
): { start: Date | null; end: Date | null } => {
  const now = new Date();

  switch (timeframe) {
    case "week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return { start: weekStart, end: now };

    case "month":
      const monthStart = new Date(now);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      return { start: monthStart, end: now };

    case "year":
      const yearStart = new Date(now);
      yearStart.setMonth(0, 1);
      yearStart.setHours(0, 0, 0, 0);
      return { start: yearStart, end: now };

    case "all":
    default:
      return { start: null, end: null };
  }
};

/**
 * Fetch user stats for a specific timeframe
 */
export const getUserStats = async (
  userId: string,
  timeframe: Timeframe = "all"
): Promise<UserStats> => {
  const { start, end } = getDateRange(timeframe);

  try {
    // Build date filter for sessions
    let sessionQuery = supabase
      .from("workout_sessions")
      .select(
        `
        id,
        started_at,
        ended_at,
        completed,
        workouts!inner(name)
      `
      )
      .eq("user_id", userId)
      .eq("completed", true);

    if (start) {
      sessionQuery = sessionQuery.gte("started_at", start.toISOString());
    }
    if (end) {
      sessionQuery = sessionQuery.lte("started_at", end.toISOString());
    }

    const { data: sessions, error: sessionsError } = await sessionQuery.order(
      "started_at",
      { ascending: false }
    );

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      throw sessionsError;
    }

    if (!sessions || sessions.length === 0) {
      return {
        total_sessions: 0,
        total_volume: 0,
        workout_streak: 0,
        active_days_this_month: 0,
        personal_records: [],
        recent_sessions: [],
      };
    }

    // Get all session IDs for further queries
    const sessionIds = sessions.map((s) => s.id);

    // Fetch all exercise sets for these sessions
    const { data: exerciseSets, error: setsError } = await supabase
      .from("exercise_sets")
      .select(
        `
        id,
        reps,
        weight,
        partial_reps,
        is_unilateral,
        left_reps,
        right_reps,
        created_at,
        session_exercises!inner(
          session_id,
          exercise_id
        )
      `
      )
      .in("session_exercises.session_id", sessionIds);

    if (setsError) {
      console.error("Error fetching exercise sets:", setsError);
      throw setsError;
    }

    // Calculate total volume
    const totalVolume =
      exerciseSets?.reduce((total, set) => {
        return total + calculateSetVolume(set as ExerciseSet);
      }, 0) || 0;

    // Calculate workout streak
    const workoutStreak = calculateWorkoutStreak(sessions);

    // Calculate active days this month
    const activeDaysThisMonth = calculateActiveDaysThisMonth(sessions);

    // Calculate personal records
    const personalRecords = await calculatePersonalRecords(exerciseSets || []);

    // Get recent sessions with stats
    const recentSessions = await getRecentSessionStats(sessions.slice(0, 10));

    return {
      total_sessions: sessions.length,
      total_volume: totalVolume,
      workout_streak: workoutStreak,
      active_days_this_month: activeDaysThisMonth,
      personal_records: personalRecords,
      recent_sessions: recentSessions,
    };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    throw error;
  }
};

/**
 * Calculate workout streak (consecutive days with completed sessions)
 */
const calculateWorkoutStreak = (sessions: any[]): number => {
  if (sessions.length === 0) return 0;

  // Sort sessions by date (most recent first)
  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's a session today or yesterday
  const hasRecentSession = sortedSessions.some((session) => {
    const sessionDate = new Date(session.started_at);
    sessionDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 1;
  });

  if (!hasRecentSession) return 0;

  // Count consecutive days
  const uniqueDays = new Set();
  sortedSessions.forEach((session) => {
    const sessionDate = new Date(session.started_at);
    sessionDate.setHours(0, 0, 0, 0);
    uniqueDays.add(sessionDate.toISOString().split("T")[0]);
  });

  const sortedDays = Array.from(uniqueDays).sort().reverse();

  for (let i = 0; i < sortedDays.length; i++) {
    const currentDay = new Date(sortedDays[i] as string);
    const nextDay =
      i < sortedDays.length - 1 ? new Date(sortedDays[i + 1] as string) : null;

    if (i === 0) {
      const daysDiff = Math.floor(
        (today.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff <= 1) {
        streak++;
      } else {
        break;
      }
    } else if (nextDay) {
      const daysDiff = Math.floor(
        (currentDay.getTime() - nextDay.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
};

/**
 * Calculate active days this month
 */
const calculateActiveDaysThisMonth = (sessions: any[]): number => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const uniqueDays = new Set();
  sessions.forEach((session) => {
    const sessionDate = new Date(session.started_at);
    if (sessionDate >= monthStart) {
      sessionDate.setHours(0, 0, 0, 0);
      uniqueDays.add(sessionDate.toISOString().split("T")[0]);
    }
  });

  return uniqueDays.size;
};

/**
 * Calculate personal records for all exercises
 */
const calculatePersonalRecords = async (
  exerciseSets: any[]
): Promise<PersonalRecord[]> => {
  if (exerciseSets.length === 0) return [];

  // Get unique exercise IDs
  const exerciseIds = [
    ...new Set(exerciseSets.map((set) => set.session_exercises.exercise_id)),
  ];

  // Fetch exercise details
  const { data: exercises, error: exercisesError } = await supabase
    .from("exercise_library")
    .select("id, name, category")
    .in("id", exerciseIds);

  if (exercisesError) {
    console.error("Error fetching exercises:", exercisesError);
    return [];
  }

  // Create exercise lookup map
  const exerciseMap = new Map<number, { name: string; category: string }>();
  exercises?.forEach((exercise) => {
    exerciseMap.set(exercise.id, {
      name: exercise.name,
      category: exercise.category,
    });
  });

  const prMap = new Map<
    number,
    {
      exercise_name: string;
      category: string;
      max_weight: number;
      max_reps: number;
      max_volume: number;
      date_achieved: string;
      session_id: string;
    }
  >();

  exerciseSets.forEach((set) => {
    const exerciseId = set.session_exercises.exercise_id;
    const exerciseInfo = exerciseMap.get(exerciseId);
    const sessionId = set.session_exercises.session_id;

    if (!exerciseInfo) return; // Skip if exercise not found

    if (!prMap.has(exerciseId)) {
      prMap.set(exerciseId, {
        exercise_name: exerciseInfo.name,
        category: exerciseInfo.category,
        max_weight: 0,
        max_reps: 0,
        max_volume: 0,
        date_achieved: set.created_at,
        session_id: sessionId,
      });
    }

    const current = prMap.get(exerciseId)!;
    const weight = set.weight || 0;
    const reps = set.is_unilateral
      ? (set.left_reps || 0) + (set.right_reps || 0)
      : set.reps || 0;
    const volume = calculateSetVolume(set as ExerciseSet);

    if (weight > current.max_weight) {
      current.max_weight = weight;
      current.date_achieved = set.created_at;
      current.session_id = sessionId;
    }

    if (reps > current.max_reps) {
      current.max_reps = reps;
    }

    if (volume > current.max_volume) {
      current.max_volume = volume;
    }
  });

  return Array.from(prMap.entries())
    .map(([exercise_id, data]) => ({
      exercise_id,
      ...data,
    }))
    .sort((a, b) => b.max_weight - a.max_weight);
};

/**
 * Get recent session stats
 */
const getRecentSessionStats = async (
  sessions: any[]
): Promise<SessionStats[]> => {
  if (sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);

  // Get exercise sets for these sessions
  const { data: exerciseSets, error } = await supabase
    .from("exercise_sets")
    .select(
      `
      id,
      reps,
      weight,
      partial_reps,
      is_unilateral,
      left_reps,
      right_reps,
      created_at,
      session_exercises!inner(session_id)
    `
    )
    .in("session_exercises.session_id", sessionIds);

  if (error) {
    console.error("Error fetching recent session sets:", error);
    return [];
  }

  // Group sets by session
  const sessionStatsMap = new Map<
    string,
    {
      sets: any[];
      exercises: Set<number>;
    }
  >();

  exerciseSets?.forEach((set) => {
    const sessionId = set.session_exercises.session_id;
    if (!sessionStatsMap.has(sessionId)) {
      sessionStatsMap.set(sessionId, { sets: [], exercises: new Set() });
    }
    const stats = sessionStatsMap.get(sessionId)!;
    stats.sets.push(set);
    // Note: We'd need to get exercise_id from session_exercises to track unique exercises
  });

  return sessions.map((session) => {
    const stats = sessionStatsMap.get(session.id) || {
      sets: [],
      exercises: new Set(),
    };
    const totalVolume = calculateTotalVolume(stats.sets as ExerciseSet[]);

    return {
      id: session.id,
      workout_name: session.workouts.name,
      started_at: session.started_at,
      ended_at: session.ended_at,
      total_volume: totalVolume,
      total_sets: stats.sets.length,
      exercises_completed: stats.exercises.size,
    };
  });
};

/**
 * Get last session data for a specific exercise in a workout
 */
export const getLastSessionData = async (
  userId: string,
  workoutId: string,
  exerciseId: number
): Promise<ExerciseSet[]> => {
  try {
    // Find the most recent completed session for this workout
    const { data: lastSession, error: sessionError } = await supabase
      .from("workout_sessions")
      .select("id, started_at")
      .eq("user_id", userId)
      .eq("workout_id", workoutId)
      .eq("completed", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !lastSession) {
      return [];
    }

    // Get the exercise sets for this exercise in that session
    const { data: exerciseSets, error: setsError } = await supabase
      .from("exercise_sets")
      .select(
        `
        id,
        reps,
        weight,
        partial_reps,
        is_unilateral,
        left_reps,
        right_reps,
        created_at,
        session_exercises!inner(
          session_id,
          exercise_id
        )
      `
      )
      .eq("session_exercises.session_id", lastSession.id)
      .eq("session_exercises.exercise_id", exerciseId)
      .order("created_at", { ascending: true });

    if (setsError) {
      console.error("Error fetching last session sets:", setsError);
      return [];
    }

    return (exerciseSets || []) as ExerciseSet[];
  } catch (error) {
    console.error("Error in getLastSessionData:", error);
    return [];
  }
};

/**
 * Get exercise history for progressive overload tracking
 */
export const getExerciseHistory = async (
  userId: string,
  exerciseId: number,
  limit: number = 10
): Promise<SessionStats[]> => {
  try {
    // Get sessions that contain this exercise
    const { data: sessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select(
        `
        id,
        started_at,
        ended_at,
        completed,
        workouts!inner(name)
      `
      )
      .eq("user_id", userId)
      .eq("completed", true)
      .in(
        "id",
        supabase
          .from("session_exercises")
          .select("session_id")
          .eq("exercise_id", exerciseId)
      )
      .order("started_at", { ascending: false })
      .limit(limit);

    if (sessionsError || !sessions) {
      return [];
    }

    return getRecentSessionStats(sessions);
  } catch (error) {
    console.error("Error in getExerciseHistory:", error);
    return [];
  }
};
