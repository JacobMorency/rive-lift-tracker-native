import { supabase } from "./supabaseClient";
import { MuscleGroup } from "./muscleGroupUtils";

export type Timeframe = "week" | "month" | "year" | "all";

export type DateRange = {
  type: "week" | "month" | "year" | "all" | "custom";
  startDate?: Date;
  endDate?: Date;
};

export type ExerciseProgressData = {
  exerciseId: number;
  exerciseName: string;
  dataPoints: { date: string; volume: number; maxWeight: number }[];
  currentPR: number;
  prHistory: { date: string; weight: number }[];
  progression: {
    volumeChange: number;
    weightChange: number;
    volumePercentage: number;
    weightPercentage: number;
    trend: "up" | "down" | "stable";
  };
};

export type VolumeDataPoint = {
  date: string;
  volume: number;
  maxWeight: number;
  maxReps: number;
};

export type MuscleGroupVolume = {
  muscleGroup: string;
  totalVolume: number;
  percentage: number;
  color: string;
};

export type BalanceMetrics = {
  pushVolume: number;
  pullVolume: number;
  legsVolume: number;
  pushPercentage: number;
  pullPercentage: number;
  legsPercentage: number;
};

export type SessionTrend = {
  date: string;
  duration: number;
  volume: number;
  exercises: number;
};

export type TimeOfDayStats = {
  hour: number;
  averageVolume: number;
  sessionCount: number;
  averageDuration: number;
};

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
  primaryMuscleGroup?: string; // Replaces category
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

export type TrackedPR = {
  exerciseId: number;
  exerciseName: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // Replaces category for display
  maxWeight: number;
  maxWeightReps: number;
  maxWeightDate: string;
  maxReps: number;
  maxRepsWeight: number;
  maxRepsDate: string;
  prHistory: PRHistoryEntry[];
};

export type PRHistoryEntry = {
  date: string;
  type: "weight" | "reps";
  value: number;
  reps?: number;
  weight?: number;
  sessionId: string;
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
    .select("id, name")
    .in("id", exerciseIds);

  if (exercisesError) {
    console.error("Error fetching exercises:", exercisesError);
    return [];
  }

  // Fetch muscle groups for all exercises
  const { getExercisesWithMuscleGroups } = await import("./muscleGroupUtils");
  const muscleGroupMap = await getExercisesWithMuscleGroups(exerciseIds);

  // Create exercise lookup map
  const exerciseMap = new Map<
    number,
    { name: string; primaryMuscleGroup?: string }
  >();
  exercises?.forEach((exercise) => {
    const muscleGroups = muscleGroupMap.get(exercise.id) || [];
    const primaryMuscleGroup =
      muscleGroups.find((mg) => mg.is_primary)?.name || muscleGroups[0]?.name;
    exerciseMap.set(exercise.id, {
      name: exercise.name,
      primaryMuscleGroup,
    });
  });

  const prMap = new Map<
    number,
    {
      exercise_name: string;
      primaryMuscleGroup?: string;
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
        primaryMuscleGroup: exerciseInfo.primaryMuscleGroup,
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
      exercise_name: data.exercise_name,
      primaryMuscleGroup: data.primaryMuscleGroup,
      max_weight: data.max_weight,
      max_reps: data.max_reps,
      max_volume: data.max_volume,
      date_achieved: data.date_achieved,
      session_id: data.session_id,
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
      session_exercises!inner(
        session_id,
        exercise_id
      )
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
    const exerciseId = set.session_exercises.exercise_id;
    if (!sessionStatsMap.has(sessionId)) {
      sessionStatsMap.set(sessionId, { sets: [], exercises: new Set() });
    }
    const stats = sessionStatsMap.get(sessionId)!;
    stats.sets.push(set);
    // Track unique exercises
    if (exerciseId) {
      stats.exercises.add(exerciseId);
    }
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
 * Get date range for filtering queries
 */
export const getDateRangeFilter = (dateRange: DateRange) => {
  if (dateRange.type === "all") return {};

  let startDate: Date;
  let endDate = new Date();

  switch (dateRange.type) {
    case "week":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "custom":
      startDate = dateRange.startDate || new Date();
      endDate = dateRange.endDate || new Date();
      break;
    default:
      return {};
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Get exercise progress data for a specific exercise
 */
export async function getExerciseProgressData(
  userId: string,
  exerciseId: number,
  dateRange: DateRange = { type: "all" }
): Promise<ExerciseProgressData> {
  try {
    const dateFilter = getDateRangeFilter(dateRange);

    // Get exercise name
    const { data: exercise, error: exerciseError } = await supabase
      .from("exercise_library")
      .select("name")
      .eq("id", exerciseId)
      .maybeSingle();

    if (exerciseError || !exercise) {
      console.error("Error fetching exercise:", exerciseError);
      return {
        exerciseId,
        exerciseName: "Unknown Exercise",
        dataPoints: [],
        currentPR: 0,
        prHistory: [],
        progression: {
          volumeChange: 0,
          weightChange: 0,
          volumePercentage: 0,
          weightPercentage: 0,
          trend: "stable",
        },
      };
    }

    // Get exercise sets with date filtering
    let query = supabase
      .from("exercise_sets")
      .select(
        `
        weight,
        reps,
        left_reps,
        right_reps,
        is_unilateral,
        created_at,
        session_exercises!inner(
          session_id,
          exercise_id,
          workout_sessions!inner(
            started_at,
            user_id
          )
        )
      `
      )
      .eq("session_exercises.exercise_id", exerciseId)
      .eq("session_exercises.workout_sessions.user_id", userId)
      .order("created_at", { ascending: true });

    if (dateFilter.startDate) {
      query = query.gte("created_at", dateFilter.startDate);
    }
    if (dateFilter.endDate) {
      query = query.lte("created_at", dateFilter.endDate);
    }

    const { data: exerciseSets, error: setsError } = await query;

    if (setsError) {
      console.error("Error fetching exercise sets:", setsError);
      return {
        exerciseId,
        exerciseName: exercise.name,
        dataPoints: [],
        currentPR: 0,
        prHistory: [],
        progression: {
          volumeChange: 0,
          weightChange: 0,
          volumePercentage: 0,
          weightPercentage: 0,
          trend: "stable",
        },
      };
    }

    // Group by date and calculate daily stats
    const dailyStats = new Map<
      string,
      { volume: number; maxWeight: number; maxReps: number }
    >();

    exerciseSets?.forEach((set: any) => {
      const date = new Date(set.created_at).toISOString().split("T")[0];
      const weight = set.weight || 0;
      const reps = set.is_unilateral
        ? (set.left_reps || 0) + (set.right_reps || 0)
        : set.reps || 0;
      const volume = weight * reps;

      if (!dailyStats.has(date)) {
        dailyStats.set(date, { volume: 0, maxWeight: 0, maxReps: 0 });
      }

      const dayStats = dailyStats.get(date)!;
      dayStats.volume += volume;
      dayStats.maxWeight = Math.max(dayStats.maxWeight, weight);
      dayStats.maxReps = Math.max(dayStats.maxReps, reps);
    });

    // Convert to data points
    const dataPoints = Array.from(dailyStats.entries()).map(
      ([date, stats]) => ({
        date,
        volume: stats.volume,
        maxWeight: stats.maxWeight,
      })
    );

    // Calculate current PR
    const currentPR = Math.max(...dataPoints.map((dp) => dp.maxWeight), 0);

    // Get PR history
    const prHistory = dataPoints
      .filter((dp) => dp.maxWeight > 0)
      .map((dp) => ({ date: dp.date, weight: dp.maxWeight }));

    // Calculate progression
    let progression = {
      volumeChange: 0,
      weightChange: 0,
      volumePercentage: 0,
      weightPercentage: 0,
      trend: "stable" as "up" | "down" | "stable",
    };

    if (dataPoints.length >= 2) {
      // Compare first half vs second half of data points
      const midpoint = Math.floor(dataPoints.length / 2);
      const firstHalf = dataPoints.slice(0, midpoint);
      const secondHalf = dataPoints.slice(midpoint);

      // Calculate averages
      const firstHalfAvgVolume =
        firstHalf.reduce((sum, dp) => sum + dp.volume, 0) / firstHalf.length;
      const secondHalfAvgVolume =
        secondHalf.reduce((sum, dp) => sum + dp.volume, 0) / secondHalf.length;
      const firstHalfAvgWeight =
        firstHalf.reduce((sum, dp) => sum + dp.maxWeight, 0) / firstHalf.length;
      const secondHalfAvgWeight =
        secondHalf.reduce((sum, dp) => sum + dp.maxWeight, 0) /
        secondHalf.length;

      // Calculate changes
      progression.volumeChange = secondHalfAvgVolume - firstHalfAvgVolume;
      progression.weightChange = secondHalfAvgWeight - firstHalfAvgWeight;
      progression.volumePercentage =
        firstHalfAvgVolume > 0
          ? (progression.volumeChange / firstHalfAvgVolume) * 100
          : 0;
      progression.weightPercentage =
        firstHalfAvgWeight > 0
          ? (progression.weightChange / firstHalfAvgWeight) * 100
          : 0;

      // Determine trend based on volume change (primary metric)
      if (progression.volumePercentage > 5) {
        progression.trend = "up";
      } else if (progression.volumePercentage < -5) {
        progression.trend = "down";
      } else {
        progression.trend = "stable";
      }
    }

    return {
      exerciseId,
      exerciseName: exercise.name,
      dataPoints,
      currentPR,
      prHistory,
      progression,
    };
  } catch (error) {
    console.error("Error in getExerciseProgressData:", error);
    return {
      exerciseId,
      exerciseName: "Unknown Exercise",
      dataPoints: [],
      currentPR: 0,
      prHistory: [],
      progression: {
        volumeChange: 0,
        weightChange: 0,
        volumePercentage: 0,
        weightPercentage: 0,
        trend: "stable",
      },
    };
  }
}

/**
 * Get volume by muscle group
 */
export async function getVolumeByMuscleGroup(
  userId: string,
  dateRange: DateRange = { type: "all" }
): Promise<MuscleGroupVolume[]> {
  try {
    const dateFilter = getDateRangeFilter(dateRange);

    // Get all exercise sets with exercise categories
    let query = supabase
      .from("exercise_sets")
      .select(
        `
        weight,
        reps,
        left_reps,
        right_reps,
        is_unilateral,
        session_exercises!inner(
          exercise_id,
          workout_sessions!inner(
            user_id,
            started_at
          )
        )
      `
      )
      .eq("session_exercises.workout_sessions.user_id", userId)
      .order("created_at", { ascending: true });

    if (dateFilter.startDate) {
      query = query.gte(
        "session_exercises.workout_sessions.started_at",
        dateFilter.startDate
      );
    }
    if (dateFilter.endDate) {
      query = query.lte(
        "session_exercises.workout_sessions.started_at",
        dateFilter.endDate
      );
    }

    const { data: exerciseSets, error: setsError } = await query;

    if (setsError) {
      console.error("Error fetching exercise sets:", setsError);
      return [];
    }

    // Get exercise muscle groups from junction table
    const exerciseIds = [
      ...new Set(
        exerciseSets?.map((set: any) => set.session_exercises.exercise_id) || []
      ),
    ];

    // Fetch muscle groups for all exercises
    const { data: exerciseMuscleGroups, error: muscleGroupsError } =
      await supabase
        .from("exercise_muscle_groups")
        .select(
          `
        exercise_id,
        is_primary,
        muscle_groups (
          id,
          name
        )
      `
        )
        .in("exercise_id", exerciseIds)
        .order("is_primary", { ascending: false });

    if (muscleGroupsError) {
      console.error(
        "Error fetching exercise muscle groups:",
        muscleGroupsError
      );
      return [];
    }

    // Create exercise to muscle groups mapping
    // For exercises with multiple muscle groups, we'll use the primary one for volume calculation
    const exerciseMuscleGroupMap = new Map<number, string>();
    exerciseMuscleGroups?.forEach((item: any) => {
      const exerciseId = item.exercise_id;
      const muscleGroupName = item.muscle_groups?.name;
      // Only set if not already set (prioritize primary)
      if (muscleGroupName && !exerciseMuscleGroupMap.has(exerciseId)) {
        exerciseMuscleGroupMap.set(exerciseId, muscleGroupName);
      }
    });

    // Calculate volume by muscle group
    const muscleGroupVolume = new Map<string, number>();

    exerciseSets?.forEach((set: any) => {
      const muscleGroup =
        exerciseMuscleGroupMap.get(set.session_exercises.exercise_id) ||
        "Other";
      const weight = set.weight || 0;
      const reps = set.is_unilateral
        ? (set.left_reps || 0) + (set.right_reps || 0)
        : set.reps || 0;
      const volume = weight * reps;

      muscleGroupVolume.set(
        muscleGroup,
        (muscleGroupVolume.get(muscleGroup) || 0) + volume
      );
    });

    // Convert to array with percentages and colors
    const totalVolume = Array.from(muscleGroupVolume.values()).reduce(
      (sum, vol) => sum + vol,
      0
    );
    const colors = [
      "#ff4b8c",
      "#10b981",
      "#f59e0b",
      "#3b82f6",
      "#8b5cf6",
      "#ef4444",
      "#06b6d4",
    ];

    return Array.from(muscleGroupVolume.entries()).map(
      ([muscleGroup, volume], index) => ({
        muscleGroup,
        totalVolume: volume,
        percentage:
          totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0,
        color: colors[index % colors.length],
      })
    );
  } catch (error) {
    console.error("Error in getVolumeByMuscleGroup:", error);
    return [];
  }
}

/**
 * Get push/pull/legs balance metrics
 */
export async function getPushPullBalance(
  userId: string,
  dateRange: DateRange = { type: "all" }
): Promise<BalanceMetrics> {
  try {
    const muscleGroupVolumes = await getVolumeByMuscleGroup(userId, dateRange);

    // Categorize muscle groups
    const pushGroups = ["Chest", "Shoulders", "Triceps"];
    const pullGroups = ["Back", "Biceps"];
    const legsGroups = ["Legs", "Glutes", "Calves"];

    let pushVolume = 0;
    let pullVolume = 0;
    let legsVolume = 0;

    muscleGroupVolumes.forEach(({ muscleGroup, totalVolume }) => {
      if (
        pushGroups.some((group) =>
          muscleGroup.toLowerCase().includes(group.toLowerCase())
        )
      ) {
        pushVolume += totalVolume;
      } else if (
        pullGroups.some((group) =>
          muscleGroup.toLowerCase().includes(group.toLowerCase())
        )
      ) {
        pullVolume += totalVolume;
      } else if (
        legsGroups.some((group) =>
          muscleGroup.toLowerCase().includes(group.toLowerCase())
        )
      ) {
        legsVolume += totalVolume;
      }
    });

    const totalVolume = pushVolume + pullVolume + legsVolume;

    return {
      pushVolume,
      pullVolume,
      legsVolume,
      pushPercentage:
        totalVolume > 0 ? Math.round((pushVolume / totalVolume) * 100) : 0,
      pullPercentage:
        totalVolume > 0 ? Math.round((pullVolume / totalVolume) * 100) : 0,
      legsPercentage:
        totalVolume > 0 ? Math.round((legsVolume / totalVolume) * 100) : 0,
    };
  } catch (error) {
    console.error("Error in getPushPullBalance:", error);
    return {
      pushVolume: 0,
      pullVolume: 0,
      legsVolume: 0,
      pushPercentage: 0,
      pullPercentage: 0,
      legsPercentage: 0,
    };
  }
}

/**
 * Get session duration trends
 */
export async function getSessionDurationTrends(
  userId: string,
  dateRange: DateRange = { type: "all" }
): Promise<SessionTrend[]> {
  try {
    const dateFilter = getDateRangeFilter(dateRange);

    let query = supabase
      .from("workout_sessions")
      .select(
        `
        id,
        started_at,
        ended_at,
        session_exercises!inner(
          exercise_sets!inner(
            weight,
            reps,
            left_reps,
            right_reps,
            is_unilateral
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: true });

    if (dateFilter.startDate) {
      query = query.gte("started_at", dateFilter.startDate);
    }
    if (dateFilter.endDate) {
      query = query.lte("started_at", dateFilter.endDate);
    }

    const { data: sessions, error: sessionsError } = await query;

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return [];
    }

    return (
      sessions?.map((session: any) => {
        const startTime = new Date(session.started_at);
        const endTime = session.ended_at
          ? new Date(session.ended_at)
          : new Date();
        const duration = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        ); // minutes

        // Calculate volume and exercise count
        let volume = 0;
        let exerciseCount = 0;

        if (session.session_exercises) {
          exerciseCount = session.session_exercises.length;
          session.session_exercises.forEach((sessionExercise: any) => {
            sessionExercise.exercise_sets?.forEach((set: any) => {
              const weight = set.weight || 0;
              const reps = set.is_unilateral
                ? (set.left_reps || 0) + (set.right_reps || 0)
                : set.reps || 0;
              volume += weight * reps;
            });
          });
        }

        return {
          date: startTime.toISOString().split("T")[0],
          duration,
          volume,
          exercises: exerciseCount,
        };
      }) || []
    );
  } catch (error) {
    console.error("Error in getSessionDurationTrends:", error);
    return [];
  }
}

/**
 * Get time of day performance stats
 */
export async function getTimeOfDayPerformance(
  userId: string
): Promise<TimeOfDayStats[]> {
  try {
    const { data: sessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select(
        `
        started_at,
        ended_at,
        session_exercises!inner(
          exercise_sets!inner(
            weight,
            reps,
            left_reps,
            right_reps,
            is_unilateral
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: true });

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return [];
    }

    // Group by hour
    const hourlyStats = new Map<
      number,
      { totalVolume: number; sessionCount: number; totalDuration: number }
    >();

    sessions?.forEach((session: any) => {
      const startTime = new Date(session.started_at);
      const hour = startTime.getHours();
      const endTime = session.ended_at
        ? new Date(session.ended_at)
        : new Date();
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      ); // minutes

      // Calculate volume
      let volume = 0;
      if (session.session_exercises) {
        session.session_exercises.forEach((sessionExercise: any) => {
          sessionExercise.exercise_sets?.forEach((set: any) => {
            const weight = set.weight || 0;
            const reps = set.is_unilateral
              ? (set.left_reps || 0) + (set.right_reps || 0)
              : set.reps || 0;
            volume += weight * reps;
          });
        });
      }

      if (!hourlyStats.has(hour)) {
        hourlyStats.set(hour, {
          totalVolume: 0,
          sessionCount: 0,
          totalDuration: 0,
        });
      }

      const stats = hourlyStats.get(hour)!;
      stats.totalVolume += volume;
      stats.sessionCount += 1;
      stats.totalDuration += duration;
    });

    // Convert to array
    return Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour,
        averageVolume:
          stats.sessionCount > 0
            ? Math.round(stats.totalVolume / stats.sessionCount)
            : 0,
        sessionCount: stats.sessionCount,
        averageDuration:
          stats.sessionCount > 0
            ? Math.round(stats.totalDuration / stats.sessionCount)
            : 0,
      }))
      .sort((a, b) => a.hour - b.hour);
  } catch (error) {
    console.error("Error in getTimeOfDayPerformance:", error);
    return [];
  }
}

/**
 * Get average rest time (placeholder - would need rest time tracking)
 */
export async function getAverageRestTime(
  userId: string,
  dateRange: DateRange = { type: "all" }
): Promise<number> {
  // This would require tracking rest times between sets
  // For now, return a placeholder value
  return 90; // 90 seconds average
}

/**
 * Get user's most used exercises ordered by frequency
 */
export async function getMostUsedExercises(
  userId: string,
  dateRange: DateRange = { type: "all" }
): Promise<
  Array<{
    id: number;
    name: string;
    muscleGroups?: MuscleGroup[];
    primaryMuscleGroup?: string; // Replaces category
    usageCount: number;
    progressionTrend: "up" | "down" | "stable";
    progressionPercentage: number;
  }>
> {
  try {
    const dateFilter = getDateRangeFilter(dateRange);

    // Get exercise usage count with exercise details
    let query = supabase
      .from("exercise_sets")
      .select(
        `
        session_exercises!inner(
          exercise_id,
          exercise_library!inner(
            id,
            name
          ),
          workout_sessions!inner(
            user_id
          )
        )
      `
      )
      .eq("session_exercises.workout_sessions.user_id", userId);

    if (dateFilter.startDate) {
      query = query.gte("created_at", dateFilter.startDate);
    }
    if (dateFilter.endDate) {
      query = query.lte("created_at", dateFilter.endDate);
    }

    const { data: exerciseSets, error: setsError } = await query;

    if (setsError) {
      console.error("Error fetching exercise usage:", setsError);
      return [];
    }

    // Count usage by exercise
    const exerciseUsage = new Map<number, { name: string; count: number }>();

    exerciseSets?.forEach((set: any) => {
      const exercise = set.session_exercises.exercise_library;
      if (exercise) {
        const current = exerciseUsage.get(exercise.id) || {
          name: exercise.name,
          count: 0,
        };
        current.count += 1;
        exerciseUsage.set(exercise.id, current);
      }
    });

    // Get muscle groups for all exercises
    const exerciseIds = Array.from(exerciseUsage.keys());
    const { getExercisesWithMuscleGroups } = await import("./muscleGroupUtils");
    const muscleGroupMap = await getExercisesWithMuscleGroups(exerciseIds);

    // Get progression data for each exercise
    const exercisesWithProgression = await Promise.all(
      Array.from(exerciseUsage.entries()).map(async ([id, data]) => {
        try {
          const progressionData = await getExerciseProgressData(
            userId,
            id,
            dateRange
          );
          const muscleGroups = muscleGroupMap.get(id) || [];
          const primaryMuscleGroup =
            muscleGroups.find((mg) => mg.is_primary)?.name ||
            muscleGroups[0]?.name;

          return {
            id,
            name: data.name,
            muscleGroups,
            primaryMuscleGroup,
            usageCount: data.count,
            progressionTrend: progressionData.progression.trend,
            progressionPercentage: progressionData.progression.volumePercentage,
          };
        } catch (error) {
          console.error(`Error getting progression for exercise ${id}:`, error);
          const muscleGroups = muscleGroupMap.get(id) || [];
          const primaryMuscleGroup =
            muscleGroups.find((mg) => mg.is_primary)?.name ||
            muscleGroups[0]?.name;

          return {
            id,
            name: data.name,
            muscleGroups,
            primaryMuscleGroup,
            usageCount: data.count,
            progressionTrend: "stable" as const,
            progressionPercentage: 0,
          };
        }
      })
    );

    // Sort by usage count
    return exercisesWithProgression.sort((a, b) => b.usageCount - a.usageCount);
  } catch (error) {
    console.error("Error in getMostUsedExercises:", error);
    return [];
  }
}

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

/**
 * Get user's tracked exercises from Supabase
 */
export async function getTrackedExercises(userId: string): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from("user_tracked_prs")
      .select("exercise_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error getting tracked exercises:", error);
      return [];
    }

    return data?.map((item) => item.exercise_id) || [];
  } catch (error) {
    console.error("Error getting tracked exercises:", error);
    return [];
  }
}

/**
 * Save tracked exercises for PR monitoring
 */
export async function saveTrackedExercises(
  userId: string,
  exerciseIds: number[]
): Promise<void> {
  try {
    // First, get current tracked exercises
    const currentTracked = await getTrackedExercises(userId);

    // Find exercises to add and remove
    const toAdd = exerciseIds.filter((id) => !currentTracked.includes(id));
    const toRemove = currentTracked.filter((id) => !exerciseIds.includes(id));

    // Remove exercises that are no longer tracked
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from("user_tracked_prs")
        .delete()
        .eq("user_id", userId)
        .in("exercise_id", toRemove);

      if (deleteError) {
        console.error("Error removing tracked exercises:", deleteError);
      }
    }

    // Add new exercises to track
    if (toAdd.length > 0) {
      const insertData = toAdd.map((exerciseId) => ({
        user_id: userId,
        exercise_id: exerciseId,
      }));

      const { error: insertError } = await supabase
        .from("user_tracked_prs")
        .insert(insertData);

      if (insertError) {
        console.error("Error adding tracked exercises:", insertError);
      }
    }
  } catch (error) {
    console.error("Error saving tracked exercises:", error);
  }
}

/**
 * Get detailed PR data for tracked exercises
 */
export async function getTrackedPRData(
  userId: string,
  exerciseIds: number[],
  dateRange: DateRange = { type: "all" }
): Promise<TrackedPR[]> {
  try {
    if (exerciseIds.length === 0) return [];

    const dateFilter = getDateRangeFilter(dateRange);
    const trackedPRs: TrackedPR[] = [];

    for (const exerciseId of exerciseIds) {
      // Get exercise details
      const { data: exercise, error: exerciseError } = await supabase
        .from("exercise_library")
        .select("name")
        .eq("id", exerciseId)
        .maybeSingle();

      if (exerciseError || !exercise) continue;

      // Get muscle groups for this exercise
      const { getExerciseMuscleGroups } = await import("./muscleGroupUtils");
      const muscleGroups = await getExerciseMuscleGroups(exerciseId);
      const primaryMuscleGroup =
        muscleGroups.find((mg) => mg.is_primary)?.name || muscleGroups[0]?.name;

      // Get all sets for this exercise
      let query = supabase
        .from("exercise_sets")
        .select(
          `
          weight,
          reps,
          left_reps,
          right_reps,
          is_unilateral,
          created_at,
          session_exercises!inner(
            session_id,
            workout_sessions!inner(
              user_id,
              started_at
            )
          )
        `
        )
        .eq("session_exercises.exercise_id", exerciseId)
        .eq("session_exercises.workout_sessions.user_id", userId)
        .order("created_at", { ascending: true });

      if (dateFilter.startDate) {
        query = query.gte("created_at", dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        query = query.lte("created_at", dateFilter.endDate);
      }

      const { data: sets, error: setsError } = await query;

      if (setsError || !sets) continue;

      // Calculate PRs and history
      let maxWeight = 0;
      let maxWeightReps = 0;
      let maxWeightDate = "";
      let maxReps = 0;
      let maxRepsWeight = 0;
      let maxRepsDate = "";
      const prHistory: PRHistoryEntry[] = [];

      sets.forEach((set: any) => {
        const weight = set.weight || 0;
        const reps = set.is_unilateral
          ? (set.left_reps || 0) + (set.right_reps || 0)
          : set.reps || 0;
        const date = set.created_at;

        // Track weight PRs (only track when weight increases)
        if (weight > maxWeight) {
          maxWeight = weight;
          maxWeightReps = reps;
          maxWeightDate = date;
          prHistory.push({
            date,
            type: "weight",
            value: weight,
            reps: reps,
            sessionId: set.session_exercises.session_id,
          });
        }

        // Track reps PRs (only track when reps increase)
        if (reps > maxReps) {
          maxReps = reps;
          maxRepsWeight = weight;
          maxRepsDate = date;
          prHistory.push({
            date,
            type: "reps",
            value: reps,
            weight: weight,
            sessionId: set.session_exercises.session_id,
          });
        }
      });

      // Sort PR history by date (newest first)
      prHistory.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      trackedPRs.push({
        exerciseId,
        exerciseName: exercise.name,
        muscleGroups,
        primaryMuscleGroup,
        maxWeight,
        maxWeightReps,
        maxWeightDate,
        maxReps,
        maxRepsWeight,
        maxRepsDate,
        prHistory,
      });
    }

    return trackedPRs;
  } catch (error) {
    console.error("Error in getTrackedPRData:", error);
    return [];
  }
}

/**
 * Get PR history timeline for an exercise
 */
export async function getPRHistory(
  userId: string,
  exerciseId: number,
  dateRange: DateRange = { type: "all" }
): Promise<PRHistoryEntry[]> {
  try {
    const trackedPRs = await getTrackedPRData(userId, [exerciseId], dateRange);
    return trackedPRs.length > 0 ? trackedPRs[0].prHistory : [];
  } catch (error) {
    console.error("Error in getPRHistory:", error);
    return [];
  }
}
