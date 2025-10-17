import { supabase } from "./supabaseClient";

export type RecurrenceType =
  | "once"
  | "daily"
  | "weekly"
  | "monthly"
  | "monthly_date";

export type WorkoutSchedule = {
  id: string;
  user_id: string;
  workout_id: string;
  recurrence_type: RecurrenceType;
  recurrence_days: number[]; // For weekly: [0-6] Sunday=0. For monthly_date: [1-31]
  start_date: string; // ISO date string
  end_date: string | null; // ISO date string or null
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ScheduledWorkout = {
  schedule: WorkoutSchedule;
  workout_name: string;
  workout_description: string | null;
};

export type CalendarMarker = {
  date: string; // YYYY-MM-DD format
  dots: Array<{
    key: string;
    color: string;
    selectedDotColor: string;
  }>;
};

/**
 * Check if a target date matches a schedule's recurrence pattern
 */
export function checkRecurrenceMatch(
  schedule: WorkoutSchedule,
  targetDate: Date
): boolean {
  const startDate = new Date(schedule.start_date);
  const endDate = schedule.end_date ? new Date(schedule.end_date) : null;
  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  // Check if target date is before start date
  if (target < start) return false;

  // Check if target date is after end date
  if (endDate) {
    const end = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );
    if (target > end) return false;
  }

  // Check if schedule is active
  if (!schedule.is_active) return false;

  switch (schedule.recurrence_type) {
    case "once":
      return target.getTime() === start.getTime();

    case "daily":
      return true;

    case "weekly":
      const dayOfWeek = target.getDay(); // 0 = Sunday, 1 = Monday, etc.
      return schedule.recurrence_days.includes(dayOfWeek);

    case "monthly":
      // Same day of month (e.g., 15th of every month)
      return target.getDate() === start.getDate();

    case "monthly_date":
      // Specific dates of month (e.g., 1st, 15th, 30th)
      return schedule.recurrence_days.includes(target.getDate());

    default:
      return false;
  }
}

/**
 * Get all scheduled workouts for a specific date
 */
export async function getScheduledWorkoutsForDate(
  userId: string,
  date: Date
): Promise<ScheduledWorkout[]> {
  try {
    const { data: schedules, error } = await supabase
      .from("workout_schedules")
      .select(
        `
        *,
        workouts!inner(
          name,
          description
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching schedules:", error);
      return [];
    }

    if (!schedules) return [];

    // Filter schedules that match the target date
    const matchingSchedules = schedules.filter((schedule) =>
      checkRecurrenceMatch(schedule as WorkoutSchedule, date)
    );

    return matchingSchedules.map((schedule) => ({
      schedule: schedule as WorkoutSchedule,
      workout_name: schedule.workouts.name,
      workout_description: schedule.workouts.description,
    }));
  } catch (error) {
    console.error("Error getting scheduled workouts for date:", error);
    return [];
  }
}

/**
 * Get all scheduled dates for a month (for calendar markers)
 */
export async function getScheduledWorkoutsForMonth(
  userId: string,
  year: number,
  month: number
): Promise<CalendarMarker[]> {
  try {
    const { data: schedules, error } = await supabase
      .from("workout_schedules")
      .select(
        `
        *,
        workouts!inner(
          name
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching schedules:", error);
      return [];
    }

    if (!schedules) return [];

    const markers: CalendarMarker[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    // Check each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const matchingSchedules = schedules.filter((schedule) =>
        checkRecurrenceMatch(schedule as WorkoutSchedule, date)
      );

      if (matchingSchedules.length > 0) {
        const dateString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        markers.push({
          date: dateString,
          dots: [
            {
              key: "scheduled",
              color: "#ff4b8c", // Primary color
              selectedDotColor: "#ff4b8c",
            },
          ],
        });
      }
    }

    return markers;
  } catch (error) {
    console.error("Error getting scheduled workouts for month:", error);
    return [];
  }
}

/**
 * Create a new workout schedule
 */
export async function createSchedule(
  schedule: Omit<WorkoutSchedule, "id" | "created_at" | "updated_at">
): Promise<WorkoutSchedule | null> {
  try {
    const { data, error } = await supabase
      .from("workout_schedules")
      .insert([schedule])
      .select()
      .single();

    if (error) {
      console.error("Error creating schedule:", error);
      return null;
    }

    return data as WorkoutSchedule;
  } catch (error) {
    console.error("Error creating schedule:", error);
    return null;
  }
}

/**
 * Update an existing workout schedule
 */
export async function updateSchedule(
  scheduleId: string,
  updates: Partial<Omit<WorkoutSchedule, "id" | "created_at" | "updated_at">>
): Promise<WorkoutSchedule | null> {
  try {
    const { data, error } = await supabase
      .from("workout_schedules")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scheduleId)
      .select()
      .single();

    if (error) {
      console.error("Error updating schedule:", error);
      return null;
    }

    return data as WorkoutSchedule;
  } catch (error) {
    console.error("Error updating schedule:", error);
    return null;
  }
}

/**
 * Delete a workout schedule
 */
export async function deleteSchedule(scheduleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("workout_schedules")
      .delete()
      .eq("id", scheduleId);

    if (error) {
      console.error("Error deleting schedule:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return false;
  }
}

/**
 * Get all schedules for a user (for management)
 */
export async function getUserSchedules(
  userId: string
): Promise<ScheduledWorkout[]> {
  try {
    const { data: schedules, error } = await supabase
      .from("workout_schedules")
      .select(
        `
        *,
        workouts!inner(
          name,
          description
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user schedules:", error);
      return [];
    }

    if (!schedules) return [];

    return schedules.map((schedule) => ({
      schedule: schedule as WorkoutSchedule,
      workout_name: schedule.workouts.name,
      workout_description: schedule.workouts.description,
    }));
  } catch (error) {
    console.error("Error getting user schedules:", error);
    return [];
  }
}

/**
 * Get today's scheduled workouts
 */
export async function getTodaysScheduledWorkouts(
  userId: string
): Promise<ScheduledWorkout[]> {
  const today = new Date();
  return getScheduledWorkoutsForDate(userId, today);
}
