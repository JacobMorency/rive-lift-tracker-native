export type Session = {
  id: string;
  name: string; // Required, from session or workout
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  workout_id?: string | null; // Optional, for backward compatibility
};

