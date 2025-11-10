import { MuscleGroup } from "../../lib/muscleGroupUtils";

export type Exercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // For backward compatibility and display
};

export type ExerciseOption = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string; // For backward compatibility and display
};

