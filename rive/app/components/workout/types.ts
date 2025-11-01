export type Exercise = {
  id: number;
  name: string;
  category: string;
};

export type WorkoutDetails = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises: Exercise[];
};
