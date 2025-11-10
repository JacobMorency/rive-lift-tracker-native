import { MuscleGroup } from "../../lib/muscleGroupUtils";

export type Exercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // For backward compatibility and display
  notes?: string | null;
  workoutExerciseId?: string;
};

export type WorkoutDetails = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises: Exercise[];
};
