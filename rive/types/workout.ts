import type { User } from "@supabase/supabase-js";

export interface BaseSet {
  reps: NullableNumber;
  weight: NullableNumber;
  partialReps: NullableNumber;
}

// for supabase (database schema)
export interface Set extends BaseSet {
  id: number;
  workout_exercise_id: number | null;
  set_number: number | null;
  exercise_name: string | null;
  workout_id: number | null;
}

// for form inputs (no id, uses exerciseId instead)
export interface SetInputs extends BaseSet {
  exerciseId: NullableNumber;
}

export type Exercise = {
  id: number;
  name: string;
};

export type ExercisesInWorkout = {
  id: NullableNumber;
  name: string;
};

export type NullableNumber = number | null;

export type Workout = {
  id: number;
  user_id: string;
  date: string; // ISO date string
  is_complete: boolean;
};

export type AuthContextType = {
  user: User | null;
  userData: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  loading: boolean;
};
