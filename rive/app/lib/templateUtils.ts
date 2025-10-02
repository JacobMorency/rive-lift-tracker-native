import { supabase } from "./supabaseClient";

/**
 * Adds an exercise to an existing workout template and updates incomplete sessions
 * @param templateId - The ID of the workout template
 * @param exerciseId - The ID of the exercise to add
 * @param orderIndex - The position in the exercise list (optional)
 */
export const addExerciseToTemplate = async (
  templateId: string,
  exerciseId: number,
  orderIndex?: number
) => {
  try {
    // Get the next order index if not provided
    if (orderIndex === undefined) {
      const { data: existingExercises } = await supabase
        .from("workout_exercises")
        .select("order_index")
        .eq("workout_id", templateId)
        .order("order_index", { ascending: false })
        .limit(1);

      orderIndex = existingExercises?.[0]?.order_index
        ? existingExercises[0].order_index + 1
        : 1;
    }

    // Add exercise to template
    const { error: templateError } = await supabase
      .from("workout_exercises")
      .insert({
        workout_id: templateId,
        exercise_id: exerciseId,
        order_index: orderIndex,
      });

    if (templateError) {
      console.error("Error adding exercise to template:", templateError);
      throw templateError;
    }

    // Update existing incomplete sessions to include the new exercise
    const { data: incompleteSessions } = await supabase
      .from("workout_sessions")
      .select("id")
      .eq("workout_id", templateId)
      .eq("completed", false);

    if (incompleteSessions && incompleteSessions.length > 0) {
      const sessionExerciseInserts = incompleteSessions.map((session) => ({
        session_id: session.id,
        exercise_id: exerciseId,
        order_index: orderIndex,
      }));

      const { error: sessionError } = await supabase
        .from("session_exercises")
        .insert(sessionExerciseInserts);

      if (sessionError) {
        console.error(
          "Error updating sessions with new exercise:",
          sessionError
        );
        // Don't throw here - template was updated successfully
      }
    }

    console.log("✅ Exercise added to template and sessions updated");
    return { success: true };
  } catch (error) {
    console.error("Error in addExerciseToTemplate:", error);
    throw error;
  }
};

/**
 * Removes an exercise from a workout template
 * @param templateId - The ID of the workout template
 * @param exerciseId - The ID of the exercise to remove
 */
export const removeExerciseFromTemplate = async (
  templateId: string,
  exerciseId: number
) => {
  try {
    // Remove from template
    const { error: templateError } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", templateId)
      .eq("exercise_id", exerciseId);

    if (templateError) {
      console.error("Error removing exercise from template:", templateError);
      throw templateError;
    }

    // Remove from incomplete sessions (but keep in completed sessions for historical accuracy)
    const { data: incompleteSessions } = await supabase
      .from("workout_sessions")
      .select("id")
      .eq("workout_id", templateId)
      .eq("completed", false);

    if (incompleteSessions && incompleteSessions.length > 0) {
      const sessionIds = incompleteSessions.map((session) => session.id);

      const { error: sessionError } = await supabase
        .from("session_exercises")
        .delete()
        .in("session_id", sessionIds)
        .eq("exercise_id", exerciseId);

      if (sessionError) {
        console.error("Error removing exercise from sessions:", sessionError);
        // Don't throw here - template was updated successfully
      }
    }

    console.log("✅ Exercise removed from template and sessions updated");
    return { success: true };
  } catch (error) {
    console.error("Error in removeExerciseFromTemplate:", error);
    throw error;
  }
};

/**
 * Reorders exercises in a workout template
 * @param templateId - The ID of the workout template
 * @param exerciseOrders - Array of { exercise_id, order_index } objects
 */
export const reorderTemplateExercises = async (
  templateId: string,
  exerciseOrders: { exercise_id: number; order_index: number }[]
) => {
  try {
    // Update template exercise order
    for (const { exercise_id, order_index } of exerciseOrders) {
      const { error } = await supabase
        .from("workout_exercises")
        .update({ order_index })
        .eq("workout_id", templateId)
        .eq("exercise_id", exercise_id);

      if (error) {
        console.error("Error updating exercise order:", error);
        throw error;
      }
    }

    // Update incomplete sessions with new order
    const { data: incompleteSessions } = await supabase
      .from("workout_sessions")
      .select("id")
      .eq("workout_id", templateId)
      .eq("completed", false);

    if (incompleteSessions && incompleteSessions.length > 0) {
      for (const session of incompleteSessions) {
        for (const { exercise_id, order_index } of exerciseOrders) {
          const { error } = await supabase
            .from("session_exercises")
            .update({ order_index })
            .eq("session_id", session.id)
            .eq("exercise_id", exercise_id);

          if (error) {
            console.error("Error updating session exercise order:", error);
            // Don't throw here - template was updated successfully
          }
        }
      }
    }

    console.log("✅ Exercise order updated in template and sessions");
    return { success: true };
  } catch (error) {
    console.error("Error in reorderTemplateExercises:", error);
    throw error;
  }
};
