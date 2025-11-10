import { MuscleGroup } from "../../../lib/muscleGroupUtils";

export type ExerciseOption = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // Replaces category
  usageCount: number;
  progressionTrend: "up" | "down" | "stable";
  progressionPercentage: number;
};

