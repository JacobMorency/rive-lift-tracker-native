export type ExerciseOption = {
  id: number;
  name: string;
  category: string;
  usageCount: number;
  progressionTrend: "up" | "down" | "stable";
  progressionPercentage: number;
};

