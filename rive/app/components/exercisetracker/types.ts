export type ExerciseSet = {
  id?: string;
  reps: number | null;
  weight: number | null;
  partialReps: number | null;
  set_number: number;
  is_unilateral?: boolean;
  left_reps?: number | null;
  right_reps?: number | null;
};
