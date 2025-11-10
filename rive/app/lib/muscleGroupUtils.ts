import { supabase } from "./supabaseClient";

export type MuscleGroup = {
  id: number;
  name: string;
  is_primary?: boolean;
};

export type ExerciseWithMuscleGroups = {
  id: number;
  name: string;
  muscleGroups: MuscleGroup[];
  primaryMuscleGroup?: string;
};

/**
 * Fetch all muscle groups for a specific exercise
 */
export async function getExerciseMuscleGroups(
  exerciseId: number
): Promise<MuscleGroup[]> {
  try {
    const { data, error } = await supabase
      .from("exercise_muscle_groups")
      .select(
        `
        muscle_group_id,
        is_primary,
        muscle_groups (
          id,
          name
        )
      `
      )
      .eq("exercise_id", exerciseId)
      .order("is_primary", { ascending: false });

    if (error) {
      console.error("Error fetching exercise muscle groups:", error);
      return [];
    }

    return (
      data?.map((item: any) => ({
        id: item.muscle_groups.id,
        name: item.muscle_groups.name,
        is_primary: item.is_primary,
      })) || []
    );
  } catch (error) {
    console.error("Error in getExerciseMuscleGroups:", error);
    return [];
  }
}

/**
 * Get the primary muscle group for an exercise
 * Returns the muscle group name or null if none found
 */
export async function getPrimaryMuscleGroup(
  exerciseId: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("exercise_muscle_groups")
      .select(
        `
        is_primary,
        muscle_groups (
          name
        )
      `
      )
      .eq("exercise_id", exerciseId)
      .eq("is_primary", true)
      .maybeSingle();

    if (error || !data) {
      // Fallback: get first muscle group if no primary is set
      const { data: fallbackData } = await supabase
        .from("exercise_muscle_groups")
        .select(
          `
          muscle_groups (
            name
          )
        `
        )
        .eq("exercise_id", exerciseId)
        .limit(1)
        .maybeSingle();

      return fallbackData?.muscle_groups?.name || null;
    }

    return data.muscle_groups?.name || null;
  } catch (error) {
    console.error("Error in getPrimaryMuscleGroup:", error);
    return null;
  }
}

/**
 * Get exercises that have a specific muscle group
 */
export async function getExercisesByMuscleGroup(
  muscleGroupName: string
): Promise<number[]> {
  try {
    // First get the muscle group ID
    const { data: muscleGroup, error: mgError } = await supabase
      .from("muscle_groups")
      .select("id")
      .eq("name", muscleGroupName)
      .maybeSingle();

    if (mgError || !muscleGroup) {
      console.error("Error fetching muscle group:", mgError);
      return [];
    }

    // Then get exercises with this muscle group
    const { data, error } = await supabase
      .from("exercise_muscle_groups")
      .select("exercise_id")
      .eq("muscle_group_id", muscleGroup.id);

    if (error) {
      console.error("Error fetching exercises by muscle group:", error);
      return [];
    }

    return data?.map((item: any) => item.exercise_id) || [];
  } catch (error) {
    console.error("Error in getExercisesByMuscleGroup:", error);
    return [];
  }
}

/**
 * Get exercises that have any of the specified muscle groups
 * Useful for filters like "Arms" which includes Biceps, Triceps, Shoulders
 */
export async function getExercisesByMuscleGroups(
  muscleGroupNames: string[]
): Promise<number[]> {
  try {
    if (muscleGroupNames.length === 0) return [];

    // First get the muscle group IDs
    const { data: muscleGroups, error: mgError } = await supabase
      .from("muscle_groups")
      .select("id")
      .in("name", muscleGroupNames);

    if (mgError || !muscleGroups || muscleGroups.length === 0) {
      console.error("Error fetching muscle groups:", mgError);
      return [];
    }

    const muscleGroupIds = muscleGroups.map((mg) => mg.id);

    // Then get exercises with these muscle groups
    const { data, error } = await supabase
      .from("exercise_muscle_groups")
      .select("exercise_id")
      .in("muscle_group_id", muscleGroupIds);

    if (error) {
      console.error("Error fetching exercises by muscle groups:", error);
      return [];
    }

    // Get unique exercise IDs
    const exerciseIds = [
      ...new Set(data?.map((item: any) => item.exercise_id) || []),
    ];
    return exerciseIds;
  } catch (error) {
    console.error("Error in getExercisesByMuscleGroups:", error);
    return [];
  }
}

/**
 * Fetch exercises with their muscle groups included
 * This is a helper for queries that need both exercise and muscle group data
 */
export async function getExercisesWithMuscleGroups(
  exerciseIds: number[]
): Promise<Map<number, MuscleGroup[]>> {
  try {
    if (exerciseIds.length === 0) return new Map();

    const { data, error } = await supabase
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

    if (error) {
      console.error("Error fetching exercises with muscle groups:", error);
      return new Map();
    }

    const exerciseMuscleGroupMap = new Map<number, MuscleGroup[]>();

    data?.forEach((item: any) => {
      const exerciseId = item.exercise_id;
      const muscleGroup: MuscleGroup = {
        id: item.muscle_groups.id,
        name: item.muscle_groups.name,
        is_primary: item.is_primary,
      };

      if (!exerciseMuscleGroupMap.has(exerciseId)) {
        exerciseMuscleGroupMap.set(exerciseId, []);
      }
      exerciseMuscleGroupMap.get(exerciseId)?.push(muscleGroup);
    });

    return exerciseMuscleGroupMap;
  } catch (error) {
    console.error("Error in getExercisesWithMuscleGroups:", error);
    return new Map();
  }
}

