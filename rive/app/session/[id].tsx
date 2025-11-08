import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import { getLastSessionData } from "../lib/statsUtils";
import ExerciseTracker from "../components/exercisetracker";
import ExerciseSelector from "../components/exerciseselector";
import { Exercise as ExerciseSelectorExercise } from "../components/exercise/types";

type Exercise = {
  id: number;
  name: string;
  category: string;
  wasInOriginalTemplate: boolean; // New field to track if exercise was in original session
  addedToTemplateAfter?: string; // When it was added to template
  notes?: string | null; // Notes for this exercise in the workout template
  workoutExerciseId?: string; // ID from workout_exercises table for updating notes
  sessionExerciseId?: string; // ID from session_exercises table for deletion tracking
};

type SessionData = {
  id: string;
  started_at: string;
  workout_id: string;
  workout_name: string;
  exercises: Exercise[];
  completed: boolean;
};

type RawWorkoutExercise = {
  id?: string; // workout_exercises table ID
  exercise_id: number;
  order_index: number;
  notes?: string | null;
};

type RawExercise = {
  id: number;
  name: string;
  category: string;
};

type ExerciseProgress = {
  exerciseId: number;
  exerciseName: string;
  sets: any[];
  completed: boolean;
  volumeTrend?: "up" | "down" | "neutral";
  volumePercentage?: number;
};

type RawExerciseSet = {
  id: string;
  reps: number;
  weight: number;
  partial_reps: number;
  is_unilateral?: boolean;
  left_reps?: number;
  right_reps?: number;
  created_at: string;
};

export default function SessionDetailPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<
    number | null
  >(null);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>(
    []
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [lastSessionSets, setLastSessionSets] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (user && id) {
      fetchSessionData();
    }
  }, [user, id]);

  const fetchSessionData = async () => {
    try {
      // First query: Fetch session data
      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("id, started_at, workout_id, completed")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (sessionError) {
        console.error("Error fetching session:", sessionError.message);
        return;
      }

      // Second query: Fetch workout name
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("name")
        .eq("id", sessionData.workout_id)
        .single();

      if (workoutError) {
        console.error("Error fetching workout:", workoutError.message);
        return;
      }

      // Third query: Fetch session exercises (session-specific exercises)
      const { data: sessionExercisesData, error: sessionExercisesError } =
        await supabase
          .from("session_exercises")
          .select("id, exercise_id, order_index")
          .eq("session_id", sessionData.id)
          .order("order_index", { ascending: true });

      if (sessionExercisesError) {
        console.error(
          "Error fetching session exercises:",
          sessionExercisesError.message
        );
        return;
      }

      // Fourth query: Fetch workout exercises (current template) for notes lookup
      const { data: workoutExercisesData, error: workoutExercisesError } =
        await supabase
          .from("workout_exercises")
          .select("id, exercise_id, order_index, notes")
          .eq("workout_id", sessionData.workout_id);

      if (workoutExercisesError) {
        console.error(
          "Error fetching workout exercises:",
          workoutExercisesError.message
        );
        return;
      }

      // Create a map of workout exercise IDs to notes
      const workoutExerciseMap = new Map<
        number,
        { id: string; notes: string | null }
      >();
      workoutExercisesData?.forEach((we) => {
        workoutExerciseMap.set(we.exercise_id, {
          id: we.id,
          notes: we.notes || null,
        });
      });

      // If no session exercises, check template
      if (!sessionExercisesData || sessionExercisesData.length === 0) {
        // If template has exercises, use those
        if (workoutExercisesData && workoutExercisesData.length > 0) {
          const exerciseIds = workoutExercisesData.map((we) => we.exercise_id);
          const { data: exercisesData, error: exercisesError } = await supabase
            .from("exercise_library")
            .select("id, name, category")
            .in("id", exerciseIds);

          if (exercisesError) {
            console.error("Error fetching exercises:", exercisesError.message);
            return;
          }

          const exerciseMap = new Map<number, RawExercise>();
          exercisesData?.forEach((exercise) => {
            exerciseMap.set(exercise.id, exercise);
          });

          const exercises = workoutExercisesData
            .map((we) => {
              const exercise = exerciseMap.get(we.exercise_id);
              const workoutExercise = workoutExerciseMap.get(we.exercise_id);
              return exercise
                ? {
                    id: exercise.id,
                    name: exercise.name,
                    category: exercise.category,
                    wasInOriginalTemplate: true,
                    notes: workoutExercise?.notes || null,
                    workoutExerciseId: workoutExercise?.id,
                    sessionExerciseId: undefined,
                  }
                : null;
            })
            .filter(
              (exercise): exercise is NonNullable<typeof exercise> =>
                exercise !== null
            )
            .sort((a, b) => {
              const aIndex =
                workoutExercisesData.find((we) => we.exercise_id === a.id)
                  ?.order_index || 0;
              const bIndex =
                workoutExercisesData.find((we) => we.exercise_id === b.id)
                  ?.order_index || 0;
              return aIndex - bIndex;
            });

          const finalSessionData = {
            id: sessionData.id,
            started_at: sessionData.started_at,
            workout_id: sessionData.workout_id,
            workout_name: workoutData.name,
            exercises,
            completed: sessionData.completed || false,
          };
          setSessionData(finalSessionData);
          const initialProgress = exercises.map((exercise) => ({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [],
            completed: false,
          }));
          const loadedProgress = await loadExistingExerciseData(
            exercises,
            initialProgress,
            finalSessionData
          );
          setExerciseProgress(loadedProgress);
          return;
        } else {
          // No exercises at all
          setSessionData({
            id: sessionData.id,
            started_at: sessionData.started_at,
            workout_id: sessionData.workout_id,
            workout_name: workoutData.name,
            exercises: [],
            completed: sessionData.completed || false,
          });
          return;
        }
      }

      // Create a map of session exercise IDs for quick lookup
      const sessionExerciseMap = new Map<
        number,
        { id: string; order_index: number }
      >();
      sessionExercisesData?.forEach((se) => {
        sessionExerciseMap.set(se.exercise_id, {
          id: se.id,
          order_index: se.order_index,
        });
      });

      // Get all unique exercise IDs (from both session and template)
      const sessionExerciseIds =
        sessionExercisesData?.map((se) => se.exercise_id) || [];
      const templateExerciseIds =
        workoutExercisesData?.map((we) => we.exercise_id) || [];
      const allExerciseIds = [
        ...new Set([...sessionExerciseIds, ...templateExerciseIds]),
      ];

      if (allExerciseIds.length === 0) {
        setSessionData({
          id: sessionData.id,
          started_at: sessionData.started_at,
          workout_id: sessionData.workout_id,
          workout_name: workoutData.name,
          exercises: [],
          completed: sessionData.completed || false,
        });
        return;
      }

      // Fifth query: Fetch exercise details for all exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_library")
        .select("id, name, category")
        .in("id", allExerciseIds);

      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError.message);
        return;
      }

      // Create a map of exercise IDs to exercise details
      const exerciseMap = new Map<number, RawExercise>();
      exercisesData?.forEach((exercise) => {
        exerciseMap.set(exercise.id, exercise);
      });

      // Merge session and template exercises
      // Always start with ALL template exercises (to preserve exercises that haven't been started yet)
      // Then add any session-specific exercises (user-added exercises not in template)
      // Use session_exercises entries to track progress and custom ordering
      const exerciseMapCombined = new Map<number, Exercise>();

      // First, add all template exercises (these are the base exercises)
      workoutExercisesData?.forEach((we) => {
        const exercise = exerciseMap.get(we.exercise_id);
        const workoutExercise = workoutExerciseMap.get(we.exercise_id);

        if (exercise) {
          // Check if this exercise has a session_exercises entry
          const sessionExercise = sessionExercisesData?.find(
            (se) => se.exercise_id === we.exercise_id
          );

          exerciseMapCombined.set(we.exercise_id, {
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            wasInOriginalTemplate: true,
            notes: workoutExercise?.notes || null,
            workoutExerciseId: workoutExercise?.id,
            sessionExerciseId: sessionExercise?.id, // Use session ID if it exists
          });
        }
      });

      // Then, add any session exercises that aren't in the template (user-added exercises)
      if (sessionExercisesData && sessionExercisesData.length > 0) {
        sessionExercisesData.forEach((se) => {
          // Only add if it's not already in the map (i.e., not in template)
          if (!exerciseMapCombined.has(se.exercise_id)) {
            const exercise = exerciseMap.get(se.exercise_id);
            const workoutExercise = workoutExerciseMap.get(se.exercise_id);

            if (exercise) {
              exerciseMapCombined.set(se.exercise_id, {
                id: exercise.id,
                name: exercise.name,
                category: exercise.category,
                wasInOriginalTemplate: !!workoutExercise,
                notes: workoutExercise?.notes || null,
                workoutExerciseId: workoutExercise?.id,
                sessionExerciseId: se.id,
              });
            }
          }
        });
      }

      // Convert map to array and sort
      // Use session order_index if available (for exercises that have been started)
      // Otherwise use template order_index (for exercises not started yet)
      // This preserves the original template order while respecting any custom ordering
      const exercises = Array.from(exerciseMapCombined.values()).sort(
        (a, b) => {
          const aSession = sessionExerciseMap.get(a.id);
          const bSession = sessionExerciseMap.get(b.id);

          // Get order_index for each exercise (prefer session, fallback to template)
          const aOrderIndex = aSession
            ? aSession.order_index
            : (workoutExercisesData?.find((we) => we.exercise_id === a.id)
                ?.order_index ?? 9999);
          const bOrderIndex = bSession
            ? bSession.order_index
            : (workoutExercisesData?.find((we) => we.exercise_id === b.id)
                ?.order_index ?? 9999);

          return aOrderIndex - bOrderIndex;
        }
      );

      // Initialize exercise progress
      const initialProgress = exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [],
        completed: false,
      }));

      // Set session data first
      const finalSessionData = {
        id: sessionData.id,
        started_at: sessionData.started_at,
        workout_id: sessionData.workout_id,
        workout_name: workoutData.name,
        exercises,
        completed: sessionData.completed || false,
      };
      setSessionData(finalSessionData);

      // Load existing exercise data from database
      const loadedProgress = await loadExistingExerciseData(
        exercises,
        initialProgress,
        finalSessionData
      );
      setExerciseProgress(loadedProgress);
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingExerciseData = async (
    exercises: Exercise[],
    initialProgress: ExerciseProgress[],
    sessionDataToUse: SessionData
  ) => {
    if (!sessionDataToUse) {
      return initialProgress;
    }

    try {
      // Get all session exercises for this session with their sets
      const { data: sessionExercises, error: sessionExercisesError } =
        await supabase
          .from("session_exercises")
          .select(
            `
          id,
          exercise_id,
          order_index,
          exercise_sets (
            id,
            reps,
            weight,
            partial_reps,
            is_unilateral,
            left_reps,
            right_reps,
            created_at
          )
        `
          )
          .eq("session_id", sessionDataToUse.id)
          .order("order_index");

      if (sessionExercisesError) {
        console.error(
          "Error loading session exercises:",
          sessionExercisesError
        );
        return initialProgress;
      }

      // Update exercise progress with loaded data
      const updatedProgress = [...initialProgress];

      sessionExercises?.forEach((sessionExercise) => {
        const exerciseIndex = exercises.findIndex(
          (ex) => ex.id === sessionExercise.exercise_id
        );

        if (exerciseIndex !== -1) {
          // Sort sets by created_at to maintain order
          const sortedSets =
            sessionExercise.exercise_sets?.sort(
              (a: RawExerciseSet, b: RawExerciseSet) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            ) || [];

          const sets = sortedSets.map((set: RawExerciseSet, index: number) => ({
            id: set.id,
            reps: set.reps,
            weight: set.weight,
            partialReps: set.partial_reps,
            set_number: index + 1,
            is_unilateral: set.is_unilateral || false,
            left_reps: set.left_reps || null,
            right_reps: set.right_reps || null,
          }));

          updatedProgress[exerciseIndex] = {
            ...updatedProgress[exerciseIndex],
            sets,
            completed: sets.length > 0,
          };
        }
      });

      return updatedProgress;
    } catch (error) {
      console.error("Error loading existing exercise data:", error);
      return initialProgress;
    }
  };

  const handleExerciseClick = async (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);

    // Fetch last session data for this exercise
    if (user && sessionData) {
      const exercise = sessionData.exercises[exerciseIndex];
      const lastSets = await getLastSessionData(
        user.id,
        sessionData.workout_id,
        exercise.id
      );
      setLastSessionSets(lastSets);
    }
  };

  const handleExerciseComplete = async (sets: any[]) => {
    if (currentExerciseIndex === null) return;

    const updatedProgress = [...exerciseProgress];

    // Compute volume trend vs last session for this exercise
    const computeVolume = (inputSets: any[]) => {
      return inputSets.reduce((total, set) => {
        const reps = set.is_unilateral
          ? (set.left_reps || 0) + (set.right_reps || 0)
          : set.reps || 0;
        const weight = set.weight || 0;
        return total + weight * reps;
      }, 0);
    };

    const currentVolume = computeVolume(sets);
    const lastVolume = computeVolume(lastSessionSets || []);
    let volumeTrend: "up" | "down" | "neutral" = "neutral";
    let volumePercentage = 0;
    if (lastVolume > 0) {
      const change = currentVolume - lastVolume;
      volumePercentage = (change / lastVolume) * 100;
      if (change > 0) volumeTrend = "up";
      else if (change < 0) volumeTrend = "down";
      else volumeTrend = "neutral";
    } else if (currentVolume > 0) {
      // No last data; keep neutral to avoid misleading signal
      volumeTrend = "neutral";
      volumePercentage = 0;
    }

    updatedProgress[currentExerciseIndex] = {
      ...updatedProgress[currentExerciseIndex],
      sets,
      completed: true,
      volumeTrend,
      volumePercentage,
    };
    setExerciseProgress(updatedProgress);
    setCurrentExerciseIndex(null);

    // Save exercise data to database
    await saveExerciseData(currentExerciseIndex, sets);
  };

  const saveExerciseData = async (exerciseIndex: number, sets: any[]) => {
    if (!sessionData || !user) return;

    const exercise = sessionData.exercises[exerciseIndex];

    try {
      // First, check if session_exercise record exists
      const { data: existingSessionExercises, error: checkError } =
        await supabase
          .from("session_exercises")
          .select("id")
          .eq("session_id", sessionData.id)
          .eq("exercise_id", exercise.id);

      if (checkError) {
        console.error("Error checking session exercise:", checkError);
        return;
      }

      let sessionExerciseData;

      if (existingSessionExercises && existingSessionExercises.length > 0) {
        // Update existing record
        const { data: updatedData, error: updateError } = await supabase
          .from("session_exercises")
          .update({ order_index: exerciseIndex })
          .eq("id", existingSessionExercises[0].id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating session exercise:", updateError);
          return;
        }
        sessionExerciseData = updatedData;
      } else {
        // Insert new record
        const { data: insertedData, error: insertError } = await supabase
          .from("session_exercises")
          .insert({
            session_id: sessionData.id,
            exercise_id: exercise.id,
            order_index: exerciseIndex,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting session exercise:", insertError);
          return;
        }
        sessionExerciseData = insertedData;
      }

      // Delete existing sets for this exercise
      await supabase
        .from("exercise_sets")
        .delete()
        .eq("session_exercise_id", sessionExerciseData.id);

      // Insert new sets with proper order
      if (sets.length > 0) {
        const setsToInsert = sets.map((set) => ({
          session_exercise_id: sessionExerciseData.id,
          reps: set.is_unilateral ? set.left_reps || 0 : set.reps, // Use left_reps for unilateral, regular reps otherwise
          weight: set.weight,
          partial_reps: set.partialReps || 0,
          is_unilateral: set.is_unilateral || false,
          left_reps: set.left_reps || null,
          right_reps: set.right_reps || null,
        }));

        const { error: setsError } = await supabase
          .from("exercise_sets")
          .insert(setsToInsert);

        if (setsError) {
          console.error("Error saving sets:", setsError);
        }
      }
    } catch (error) {
      console.error("Error saving exercise data:", error);
    }
  };

  const handleNotesUpdate = async (notes: string) => {
    if (
      currentExerciseIndex === null ||
      !sessionData ||
      !sessionData.exercises[currentExerciseIndex]?.workoutExerciseId
    ) {
      return;
    }

    const exercise = sessionData.exercises[currentExerciseIndex];
    const workoutExerciseId = exercise.workoutExerciseId;

    if (!workoutExerciseId) {
      console.error("No workoutExerciseId available for notes update");
      return;
    }

    try {
      // Update notes in workout_exercises table
      const { error: updateError } = await supabase
        .from("workout_exercises")
        .update({ notes: notes.trim() || null })
        .eq("id", workoutExerciseId);

      if (updateError) {
        console.error("Error updating exercise notes:", updateError);
        Alert.alert("Error", "Failed to save notes");
        return;
      }

      // Update local state to reflect the change
      const updatedExercises = [...sessionData.exercises];
      updatedExercises[currentExerciseIndex] = {
        ...updatedExercises[currentExerciseIndex],
        notes: notes.trim() || null,
      };

      setSessionData({
        ...sessionData,
        exercises: updatedExercises,
      });
    } catch (error) {
      console.error("Error updating exercise notes:", error);
      Alert.alert("Error", "Failed to save notes");
    }
  };

  const handleAddExercise = async (
    selectedExercises: ExerciseSelectorExercise[]
  ) => {
    if (!sessionData || !user || selectedExercises.length === 0) return;

    setShowAddExerciseModal(false);

    // Show alert asking if user wants to save to template
    Alert.alert(
      "Save to Workout Template?",
      "Do you want to add these exercises to the workout template as well, or just this session?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Session Only",
          onPress: async () => {
            await addExercisesToSession(selectedExercises, false);
          },
        },
        {
          text: "Template + Session",
          onPress: async () => {
            await addExercisesToSession(selectedExercises, true);
          },
        },
      ]
    );
  };

  const addExercisesToSession = async (
    selectedExercises: ExerciseSelectorExercise[],
    saveToTemplate: boolean
  ) => {
    if (!sessionData || !user) return;

    try {
      const currentExerciseCount = sessionData.exercises.length;
      const startOrderIndex = currentExerciseCount;

      // First, add to template if requested
      if (saveToTemplate) {
        for (let i = 0; i < selectedExercises.length; i++) {
          const exercise = selectedExercises[i];
          const orderIndex = startOrderIndex + i;

          // Check if exercise already exists in template
          const { data: existing } = await supabase
            .from("workout_exercises")
            .select("id")
            .eq("workout_id", sessionData.workout_id)
            .eq("exercise_id", exercise.id)
            .single();

          if (!existing) {
            await supabase.from("workout_exercises").insert({
              workout_id: sessionData.workout_id,
              exercise_id: exercise.id,
              order_index: orderIndex,
            });
          }
        }
      }

      // Add to session_exercises
      const sessionExercisesToInsert = selectedExercises.map(
        (exercise, index) => ({
          session_id: sessionData.id,
          exercise_id: exercise.id,
          order_index: startOrderIndex + index,
        })
      );

      const { error: insertError } = await supabase
        .from("session_exercises")
        .insert(sessionExercisesToInsert);

      if (insertError) {
        console.error("Error adding exercises to session:", insertError);
        Alert.alert("Error", "Failed to add exercises");
        return;
      }

      // Refresh session data
      await fetchSessionData();
    } catch (error) {
      console.error("Error adding exercises:", error);
      Alert.alert("Error", "Failed to add exercises");
    }
  };

  const handleRemoveExercise = async (exerciseIndex: number) => {
    if (
      !sessionData ||
      exerciseIndex < 0 ||
      exerciseIndex >= sessionData.exercises.length
    )
      return;

    const exercise = sessionData.exercises[exerciseIndex];
    const progress = exerciseProgress[exerciseIndex];
    const setCount = progress?.sets.length || 0;

    // Show confirmation if exercise has sets
    if (setCount > 0) {
      Alert.alert(
        "Remove Exercise?",
        `This exercise has ${setCount} set${setCount !== 1 ? "s" : ""}. Deleting it will remove all sets. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await removeExerciseFromSession(exerciseIndex, exercise);
            },
          },
        ]
      );
    } else {
      await removeExerciseFromSession(exerciseIndex, exercise);
    }
  };

  const removeExerciseFromSession = async (
    exerciseIndex: number,
    exercise: Exercise
  ) => {
    if (!sessionData) return;

    // If exercise doesn't have sessionExerciseId, it means it's only in template
    // Create a session_exercise entry first, then delete it (to ensure consistency)
    let sessionExerciseId = exercise.sessionExerciseId;

    if (!sessionExerciseId) {
      // Check if it already exists
      const { data: existing } = await supabase
        .from("session_exercises")
        .select("id")
        .eq("session_id", sessionData.id)
        .eq("exercise_id", exercise.id)
        .single();

      if (existing) {
        sessionExerciseId = existing.id;
      } else {
        // Create it first with current order_index
        const { data: inserted, error: insertError } = await supabase
          .from("session_exercises")
          .insert({
            session_id: sessionData.id,
            exercise_id: exercise.id,
            order_index: exerciseIndex,
          })
          .select()
          .single();

        if (insertError || !inserted) {
          console.error("Error creating session exercise:", insertError);
          Alert.alert("Error", "Failed to remove exercise");
          return;
        }

        sessionExerciseId = inserted.id;
      }
    }

    try {
      // Delete sets first (if any)
      const { data: sessionExerciseData } = await supabase
        .from("session_exercises")
        .select("id")
        .eq("id", sessionExerciseId)
        .single();

      if (sessionExerciseData) {
        await supabase
          .from("exercise_sets")
          .delete()
          .eq("session_exercise_id", sessionExerciseData.id);
      }

      // Delete from session_exercises
      const { error: deleteError } = await supabase
        .from("session_exercises")
        .delete()
        .eq("id", sessionExerciseId);

      if (deleteError) {
        console.error("Error removing exercise from session:", deleteError);
        Alert.alert("Error", "Failed to remove exercise");
        return;
      }

      // After deletion, ensure remaining template exercises have session_exercises entries
      // This prevents them from reappearing when we fetch again
      const remainingExercises = sessionData.exercises.filter(
        (_, index) => index !== exerciseIndex
      );

      // Get current session_exercises count to see if we need to create entries
      const { data: remainingSessionExercises } = await supabase
        .from("session_exercises")
        .select("exercise_id")
        .eq("session_id", sessionData.id);

      const remainingSessionExerciseIds = new Set(
        remainingSessionExercises?.map((se) => se.exercise_id) || []
      );

      // Create session_exercises entries for remaining template exercises that don't have them
      const exercisesToAdd = remainingExercises
        .filter(
          (ex) =>
            !ex.sessionExerciseId && !remainingSessionExerciseIds.has(ex.id)
        )
        .map((ex, idx) => {
          // Find the index in the original list (before removal)
          const originalIndex = sessionData.exercises.findIndex(
            (e) => e.id === ex.id
          );
          const adjustedIndex =
            originalIndex < exerciseIndex ? originalIndex : originalIndex - 1;
          return {
            session_id: sessionData.id,
            exercise_id: ex.id,
            order_index: adjustedIndex,
          };
        });

      if (exercisesToAdd.length > 0) {
        await supabase.from("session_exercises").insert(exercisesToAdd);
      }

      // Update local state
      const updatedExercises = remainingExercises;
      const updatedProgress = exerciseProgress.filter(
        (_, index) => index !== exerciseIndex
      );

      setSessionData({
        ...sessionData,
        exercises: updatedExercises,
      });
      setExerciseProgress(updatedProgress);

      // If currently tracking this exercise, go back to list
      if (currentExerciseIndex === exerciseIndex) {
        setCurrentExerciseIndex(null);
      } else if (
        currentExerciseIndex !== null &&
        currentExerciseIndex > exerciseIndex
      ) {
        // Adjust current exercise index if we removed an exercise before it
        setCurrentExerciseIndex(currentExerciseIndex - 1);
      }

      // Refresh to get updated sessionExerciseId values
      await fetchSessionData();
    } catch (error) {
      console.error("Error removing exercise:", error);
      Alert.alert("Error", "Failed to remove exercise");
    }
  };

  const handleBackToExercises = () => {
    setCurrentExerciseIndex(null);
  };

  const handleBack = () => {
    router.push("/(tabs)/sessions");
  };

  const handleCancelSession = () => {
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this session? This will permanently delete the session and all your progress.",
      [
        { text: "Keep Session", style: "cancel" },
        {
          text: "Delete Session",
          style: "destructive",
          onPress: handleConfirmCancel,
        },
      ]
    );
  };

  const handleConfirmCancel = async () => {
    if (!sessionData || !user) return;

    try {
      // Delete the session from the database
      const { error: deleteError } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("id", sessionData.id);

      if (deleteError) {
        console.error("Error deleting session:", deleteError);
        return;
      }

      // Navigate back to sessions list
      router.push("/(tabs)/sessions");
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionData || !user) return;

    try {
      // Update the session to mark it as completed
      const { error: updateError } = await supabase
        .from("workout_sessions")
        .update({
          completed: true,
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionData.id);

      if (updateError) {
        console.error("Error completing session:", updateError);
        return;
      }

      // Navigate back to sessions list
      router.push("/(tabs)/sessions");
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-base-100">
        {/* Header */}
        <View
          className="bg-base-200 px-4 border-b border-base-300"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <Text className="text-2xl font-bold text-base-content">Session</Text>
        </View>

        {/* Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <Text className="text-muted mt-2">Loading session...</Text>
        </View>
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View className="flex-1 bg-base-100">
        {/* Header */}
        <View
          className="bg-base-200 px-4 border-b border-base-300"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <Text className="text-2xl font-bold text-base-content">
            Session Not Found
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-muted text-center">
            Session not found or you don&apos;t have access to it.
          </Text>
        </View>
      </View>
    );
  }

  // If we're tracking an exercise, show the exercise tracker
  if (currentExerciseIndex !== null) {
    const exercise = sessionData.exercises[currentExerciseIndex];
    const progress = exerciseProgress[currentExerciseIndex];

    return (
      <ExerciseTracker
        exercise={exercise}
        onComplete={handleExerciseComplete}
        onBack={handleBackToExercises}
        initialSets={progress.sets}
        lastSessionSets={lastSessionSets}
        onNotesUpdate={handleNotesUpdate}
      />
    );
  }

  // Show exercise list
  return (
    <View className="flex-1 bg-base-100">
      {/* Header */}
      <View
        className="bg-base-200 px-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-base-content">
              {sessionData.workout_name}
            </Text>
            <Text className="text-muted mt-1">
              Started {new Date(sessionData.started_at).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center ${
                exerciseProgress.every((ex) => !ex.completed)
                  ? "bg-base-300"
                  : "bg-success"
              }`}
              onPress={handleCompleteSession}
              disabled={exerciseProgress.every((ex) => !ex.completed)}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={
                  exerciseProgress.every((ex) => !ex.completed)
                    ? "#9ca3af"
                    : "#002d40"
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-8 h-8 bg-error rounded-full items-center justify-center"
              onPress={handleCancelSession}
            >
              <Ionicons name="trash-outline" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Back Button */}
        <View className="mb-4">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color="#ff4b8c" />
            <Text className="text-primary ml-2 font-medium">
              Back to Sessions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-base-content">
              Progress
            </Text>
            <Text className="text-sm text-muted">
              {exerciseProgress.filter((ex) => ex.completed).length} of{" "}
              {sessionData.exercises.length} completed
            </Text>
          </View>
          <View className="bg-base-300 rounded-full h-2">
            <View
              className="bg-primary rounded-full h-2"
              style={{
                width: `${sessionData.exercises.length > 0 ? (exerciseProgress.filter((ex) => ex.completed).length / sessionData.exercises.length) * 100 : 0}%`,
              }}
            />
          </View>
          {exerciseProgress.filter((ex) => ex.completed).length ===
            sessionData.exercises.length &&
            sessionData.exercises.length > 0 && (
              <Text className="text-success text-sm font-medium mt-2 text-center">
                🎉 All exercises completed! Ready to finish your session.
              </Text>
            )}
        </View>

        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-base-content">
              Exercises ({sessionData.exercises.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddExerciseModal(true)}
              className="flex-row items-center px-3 py-1.5 bg-primary rounded-lg"
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text className="text-white font-medium ml-1">Add Exercise</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-muted text-sm">
            Tap an exercise to start tracking your sets
          </Text>
        </View>

        {sessionData.exercises.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <View className="w-16 h-16 bg-base-300 rounded-full items-center justify-center mb-4">
              <Ionicons name="barbell-outline" size={32} color="#ff4b8c" />
            </View>
            <Text className="text-lg font-semibold text-base-content mb-2">
              No Exercises
            </Text>
            <Text className="text-muted text-center">
              This workout template has no exercises
            </Text>
          </View>
        ) : (
          <View>
            {sessionData.exercises.map((exercise, index) => {
              const progress = exerciseProgress[index];
              const isCompleted = progress?.completed;
              const setCount = progress?.sets.length || 0;
              const hasStarted = setCount > 0;

              // Get exercise icon based on category
              const getExerciseIcon = (category: string): "barbell-outline" => {
                // Use dumbbell icon for all exercise categories
                return "barbell-outline";
              };

              // Status is now indicated by icon background color and progress bar

              return (
                <View key={exercise.id}>
                  <TouchableOpacity
                    className={`rounded-xl p-4 ${
                      isCompleted
                        ? "bg-success/10 border border-success/20"
                        : hasStarted
                          ? "bg-warning/10 border border-warning/20"
                          : "bg-base-200 border border-base-300"
                    }`}
                    onPress={() => handleExerciseClick(index)}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                  >
                    <View className="flex-row items-center">
                      {/* Exercise Icon */}
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                          isCompleted
                            ? "bg-success"
                            : hasStarted
                              ? "bg-warning"
                              : "bg-base-300"
                        }`}
                      >
                        <Ionicons
                          name={getExerciseIcon(exercise.category)}
                          size={24}
                          color={
                            isCompleted
                              ? "#ffffff"
                              : hasStarted
                                ? "#ffffff"
                                : "#6b7280"
                          }
                        />
                      </View>

                      {/* Exercise Info */}
                      <View className="flex-1">
                        <View className="mb-1">
                          <Text className="text-lg font-semibold text-base-content">
                            {formatExerciseName(exercise.name)}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">
                            {exercise.category}
                          </Text>
                          {setCount > 0 && (
                            <View className="flex-row items-center">
                              <Ionicons
                                name="list-outline"
                                size={14}
                                color="#6b7280"
                              />
                              <Text className="text-sm text-muted ml-1">
                                {setCount} set{setCount !== 1 ? "s" : ""}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Delete Button */}
                      <TouchableOpacity
                        onPress={() => handleRemoveExercise(index)}
                        className="mr-2 p-2"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#ef4444"
                        />
                      </TouchableOpacity>

                      {/* Chevron */}
                      <View className="ml-2">
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                  {index < sessionData.exercises.length - 1 && (
                    <View className="mb-4" />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowAddExerciseModal(false)}
      >
        <ExerciseSelector
          onExerciseSelect={handleAddExercise}
          onClose={() => setShowAddExerciseModal(false)}
          existingExercises={sessionData?.exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            category: ex.category,
          }))}
          title="Add Exercises to Session"
          confirmText="Add"
          showCloseButton={true}
          workoutName={sessionData?.workout_name}
        />
      </Modal>
    </View>
  );
}
