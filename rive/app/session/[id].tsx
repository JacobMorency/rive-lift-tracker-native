import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { getLastSessionData } from "../lib/statsUtils";
import ExerciseTracker from "../components/exercisetracker/ExerciseTracker";
import ExerciseSelector from "../components/ExerciseSelector";
import { Exercise as ExerciseSelectorExercise } from "../components/exercise/types";
import SessionDetailTopBar from "../components/session/SessionDetailTopBar";
import SessionOverviewSection from "../components/session/SessionOverviewSection";
import SessionExerciseList from "../components/session/SessionExerciseList";
import AppText from "../components/ui/AppText";
import AppButton from "../components/ui/AppButton";
import StickyBottomPrimaryButton, {
  STICKY_BOTTOM_PRIMARY_SCROLL_PADDING,
} from "../components/ui/StickyBottomPrimaryButton";

import { MuscleGroup } from "../lib/muscleGroupUtils";

type Exercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string;
  wasInOriginalTemplate: boolean;
  addedToTemplateAfter?: string;
  notes?: string | null;
  workoutExerciseId?: string;
  sessionExerciseId?: string;
};

type SessionData = {
  id: string;
  started_at: string;
  workout_id: string;
  workout_name: string;
  exercises: Exercise[];
  completed: boolean;
};

type RawExercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string;
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
    [],
  );
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [lastSessionSets, setLastSessionSets] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (user && id) {
      fetchSessionData();
    }
  }, [user, id]);

  const fetchSessionData = async () => {
    try {
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

      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("name")
        .eq("id", sessionData.workout_id)
        .single();

      if (workoutError) {
        console.error("Error fetching workout:", workoutError.message);
        return;
      }

      const { data: sessionExercisesData, error: sessionExercisesError } =
        await supabase
          .from("session_exercises")
          .select("id, exercise_id, order_index")
          .eq("session_id", sessionData.id)
          .order("order_index", { ascending: true });

      if (sessionExercisesError) {
        console.error(
          "Error fetching session exercises:",
          sessionExercisesError.message,
        );
        return;
      }

      const { data: workoutExercisesData, error: workoutExercisesError } =
        await supabase
          .from("workout_exercises")
          .select("id, exercise_id, order_index, notes")
          .eq("workout_id", sessionData.workout_id);

      if (workoutExercisesError) {
        console.error(
          "Error fetching workout exercises:",
          workoutExercisesError.message,
        );
        return;
      }

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

      if (!sessionExercisesData || sessionExercisesData.length === 0) {
        if (workoutExercisesData && workoutExercisesData.length > 0) {
          const exerciseIds = workoutExercisesData.map((we) => we.exercise_id);
          const { data: exercisesData, error: exercisesError } = await supabase
            .from("exercise_library")
            .select("id, name")
            .in("id", exerciseIds);

          if (exercisesError) {
            console.error("Error fetching exercises:", exercisesError.message);
            return;
          }

          const { getExercisesWithMuscleGroups } = await import(
            "../lib/muscleGroupUtils"
          );
          const muscleGroupMap =
            await getExercisesWithMuscleGroups(exerciseIds);

          const exerciseMap = new Map<number, RawExercise>();
          exercisesData?.forEach((exercise) => {
            const muscleGroups = muscleGroupMap.get(exercise.id) || [];
            const primaryMuscleGroup =
              muscleGroups.find((mg) => mg.is_primary)?.name ||
              muscleGroups[0]?.name;
            exerciseMap.set(exercise.id, {
              ...exercise,
              muscleGroups,
              primaryMuscleGroup,
            });
          });

          const exercises = workoutExercisesData
            .map((we) => {
              const exercise = exerciseMap.get(we.exercise_id);
              const workoutExercise = workoutExerciseMap.get(we.exercise_id);
              return exercise
                ? {
                    id: exercise.id,
                    name: exercise.name,
                    muscleGroups: exercise.muscleGroups,
                    primaryMuscleGroup: exercise.primaryMuscleGroup,
                    wasInOriginalTemplate: true,
                    notes: workoutExercise?.notes || null,
                    workoutExerciseId: workoutExercise?.id,
                    sessionExerciseId: undefined,
                  }
                : null;
            })
            .filter(
              (exercise): exercise is NonNullable<typeof exercise> =>
                exercise !== null,
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
            finalSessionData,
          );
          setExerciseProgress(loadedProgress);
          return;
        } else {
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

      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_library")
        .select("id, name")
        .in("id", allExerciseIds);

      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError.message);
        return;
      }

      const { getExercisesWithMuscleGroups } = await import(
        "../lib/muscleGroupUtils"
      );
      const muscleGroupMap = await getExercisesWithMuscleGroups(allExerciseIds);

      const exerciseMap = new Map<number, RawExercise>();
      exercisesData?.forEach((exercise) => {
        const muscleGroups = muscleGroupMap.get(exercise.id) || [];
        const primaryMuscleGroup =
          muscleGroups.find((mg) => mg.is_primary)?.name ||
          muscleGroups[0]?.name;
        exerciseMap.set(exercise.id, {
          ...exercise,
          muscleGroups,
          primaryMuscleGroup,
        });
      });

      const exerciseMapCombined = new Map<number, Exercise>();

      workoutExercisesData?.forEach((we) => {
        const exercise = exerciseMap.get(we.exercise_id);
        const workoutExercise = workoutExerciseMap.get(we.exercise_id);

        if (exercise) {
          const sessionExercise = sessionExercisesData?.find(
            (se) => se.exercise_id === we.exercise_id,
          );

          exerciseMapCombined.set(we.exercise_id, {
            id: exercise.id,
            name: exercise.name,
            muscleGroups: exercise.muscleGroups,
            primaryMuscleGroup: exercise.primaryMuscleGroup,
            wasInOriginalTemplate: true,
            notes: workoutExercise?.notes || null,
            workoutExerciseId: workoutExercise?.id,
            sessionExerciseId: sessionExercise?.id,
          });
        }
      });

      if (sessionExercisesData && sessionExercisesData.length > 0) {
        sessionExercisesData.forEach((se) => {
          if (!exerciseMapCombined.has(se.exercise_id)) {
            const exercise = exerciseMap.get(se.exercise_id);
            const workoutExercise = workoutExerciseMap.get(se.exercise_id);

            if (exercise) {
              exerciseMapCombined.set(se.exercise_id, {
                id: exercise.id,
                name: exercise.name,
                muscleGroups: exercise.muscleGroups,
                primaryMuscleGroup: exercise.primaryMuscleGroup,
                wasInOriginalTemplate: !!workoutExercise,
                notes: workoutExercise?.notes || null,
                workoutExerciseId: workoutExercise?.id,
                sessionExerciseId: se.id,
              });
            }
          }
        });
      }

      const exercises = Array.from(exerciseMapCombined.values()).sort(
        (a, b) => {
          const aSession = sessionExerciseMap.get(a.id);
          const bSession = sessionExerciseMap.get(b.id);

          const aOrderIndex = aSession
            ? aSession.order_index
            : (workoutExercisesData?.find((we) => we.exercise_id === a.id)
                ?.order_index ?? 9999);
          const bOrderIndex = bSession
            ? bSession.order_index
            : (workoutExercisesData?.find((we) => we.exercise_id === b.id)
                ?.order_index ?? 9999);

          return aOrderIndex - bOrderIndex;
        },
      );

      const initialProgress = exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [],
        completed: false,
      }));

      const finalSessionData = {
        id: sessionData.id,
        started_at: sessionData.started_at,
        workout_id: sessionData.workout_id,
        workout_name: workoutData.name,
        exercises,
        completed: sessionData.completed || false,
      };
      setSessionData(finalSessionData);

      const loadedProgress = await loadExistingExerciseData(
        exercises,
        initialProgress,
        finalSessionData,
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
    sessionDataToUse: SessionData,
  ) => {
    if (!sessionDataToUse) {
      return initialProgress;
    }

    try {
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
        `,
          )
          .eq("session_id", sessionDataToUse.id)
          .order("order_index");

      if (sessionExercisesError) {
        console.error(
          "Error loading session exercises:",
          sessionExercisesError,
        );
        return initialProgress;
      }

      const updatedProgress = [...initialProgress];

      sessionExercises?.forEach((sessionExercise) => {
        const exerciseIndex = exercises.findIndex(
          (ex) => ex.id === sessionExercise.exercise_id,
        );

        if (exerciseIndex !== -1) {
          const sortedSets =
            sessionExercise.exercise_sets?.sort(
              (a: RawExerciseSet, b: RawExerciseSet) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
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

    if (user && sessionData) {
      const exercise = sessionData.exercises[exerciseIndex];
      const lastSets = await getLastSessionData(
        user.id,
        sessionData.workout_id,
        exercise.id,
      );
      setLastSessionSets(lastSets);
    }
  };

  const handleExerciseComplete = async (sets: any[]) => {
    if (currentExerciseIndex === null) return;

    const updatedProgress = [...exerciseProgress];

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

    await saveExerciseData(currentExerciseIndex, sets);
  };

  const saveExerciseData = async (exerciseIndex: number, sets: any[]) => {
    if (!sessionData || !user) return;

    const exercise = sessionData.exercises[exerciseIndex];

    try {
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

      await supabase
        .from("exercise_sets")
        .delete()
        .eq("session_exercise_id", sessionExerciseData.id);

      if (sets.length > 0) {
        const setsToInsert = sets.map((set) => ({
          session_exercise_id: sessionExerciseData.id,
          reps: set.is_unilateral ? set.left_reps || 0 : set.reps,
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
      const { error: updateError } = await supabase
        .from("workout_exercises")
        .update({ notes: notes.trim() || null })
        .eq("id", workoutExerciseId);

      if (updateError) {
        console.error("Error updating exercise notes:", updateError);
        Alert.alert("Error", "Failed to save notes");
        return;
      }

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
    selectedExercises: ExerciseSelectorExercise[],
  ) => {
    if (!sessionData || !user || selectedExercises.length === 0) return;

    setShowAddExerciseModal(false);

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
      ],
    );
  };

  const addExercisesToSession = async (
    selectedExercises: ExerciseSelectorExercise[],
    saveToTemplate: boolean,
  ) => {
    if (!sessionData || !user) return;

    try {
      const currentExerciseCount = sessionData.exercises.length;
      const startOrderIndex = currentExerciseCount;

      if (saveToTemplate) {
        for (let i = 0; i < selectedExercises.length; i++) {
          const exercise = selectedExercises[i];
          const orderIndex = startOrderIndex + i;

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

      const sessionExercisesToInsert = selectedExercises.map(
        (exercise, index) => ({
          session_id: sessionData.id,
          exercise_id: exercise.id,
          order_index: startOrderIndex + index,
        }),
      );

      const { error: insertError } = await supabase
        .from("session_exercises")
        .insert(sessionExercisesToInsert);

      if (insertError) {
        console.error("Error adding exercises to session:", insertError);
        Alert.alert("Error", "Failed to add exercises");
        return;
      }

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
        ],
      );
    } else {
      await removeExerciseFromSession(exerciseIndex, exercise);
    }
  };

  const removeExerciseFromSession = async (
    exerciseIndex: number,
    exercise: Exercise,
  ) => {
    if (!sessionData) return;

    let sessionExerciseId = exercise.sessionExerciseId;

    if (!sessionExerciseId) {
      const { data: existing } = await supabase
        .from("session_exercises")
        .select("id")
        .eq("session_id", sessionData.id)
        .eq("exercise_id", exercise.id)
        .single();

      if (existing) {
        sessionExerciseId = existing.id;
      } else {
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

      const { error: deleteError } = await supabase
        .from("session_exercises")
        .delete()
        .eq("id", sessionExerciseId);

      if (deleteError) {
        console.error("Error removing exercise from session:", deleteError);
        Alert.alert("Error", "Failed to remove exercise");
        return;
      }

      const remainingExercises = sessionData.exercises.filter(
        (_, index) => index !== exerciseIndex,
      );

      const { data: remainingSessionExercises } = await supabase
        .from("session_exercises")
        .select("exercise_id")
        .eq("session_id", sessionData.id);

      const remainingSessionExerciseIds = new Set(
        remainingSessionExercises?.map((se) => se.exercise_id) || [],
      );

      const exercisesToAdd = remainingExercises
        .filter(
          (ex) =>
            !ex.sessionExerciseId && !remainingSessionExerciseIds.has(ex.id),
        )
        .map((ex, idx) => {
          const originalIndex = sessionData.exercises.findIndex(
            (e) => e.id === ex.id,
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

      const updatedExercises = remainingExercises;
      const updatedProgress = exerciseProgress.filter(
        (_, index) => index !== exerciseIndex,
      );

      setSessionData({
        ...sessionData,
        exercises: updatedExercises,
      });
      setExerciseProgress(updatedProgress);

      if (currentExerciseIndex === exerciseIndex) {
        setCurrentExerciseIndex(null);
      } else if (
        currentExerciseIndex !== null &&
        currentExerciseIndex > exerciseIndex
      ) {
        setCurrentExerciseIndex(currentExerciseIndex - 1);
      }

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
      ],
    );
  };

  const handleConfirmCancel = async () => {
    if (!sessionData || !user) return;

    try {
      const { error: deleteError } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("id", sessionData.id);

      if (deleteError) {
        console.error("Error deleting session:", deleteError);
        return;
      }

      router.push("/(tabs)/sessions");
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionData || !user) return;

    try {
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
      <View className="flex-1 bg-background dark:bg-background-dark">
        <SessionDetailTopBar
          onBack={handleBack}
          secondaryAction={{
            label: "Close",
            onPress: handleBack,
          }}
        />
        <View className="flex-1 justify-center items-center px-4">
          <ActivityIndicator
            size="large"
            color={isDark ? "#ff6fa1" : "#ff4b8c"}
          />
          <AppText
            variant="body"
            tone="muted"
            className="normal-case mt-3 text-center"
          >
            Loading session...
          </AppText>
        </View>
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <SessionDetailTopBar
          onBack={handleBack}
          secondaryAction={{
            label: "Close",
            onPress: handleBack,
          }}
        />
        <View className="flex-1 justify-center items-center px-4">
          <AppText
            variant="subheader"
            tone="default"
            className="text-center mb-2 normal-case font-bold"
          >
            Session not found
          </AppText>
          <AppText
            variant="body"
            tone="muted"
            className="text-center normal-case max-w-sm"
          >
            This session does not exist or you do not have access to it.
          </AppText>
        </View>
      </View>
    );
  }

  if (currentExerciseIndex !== null) {
    const exercise = sessionData.exercises[currentExerciseIndex];
    const progress = exerciseProgress[currentExerciseIndex];

    return (
      <ExerciseTracker
        exercise={{
          id: exercise.id,
          name: exercise.name,
          category: exercise.primaryMuscleGroup || "Exercise",
          notes: exercise.notes,
          workoutExerciseId: exercise.workoutExerciseId,
          primaryMuscleGroup: exercise.primaryMuscleGroup,
        }}
        onComplete={handleExerciseComplete}
        onBack={handleBackToExercises}
        initialSets={progress.sets}
        lastSessionSets={lastSessionSets}
        onNotesUpdate={handleNotesUpdate}
      />
    );
  }

  const completedCount = exerciseProgress.filter((ex) => ex.completed).length;
  const totalExercises = sessionData.exercises.length;
  const finishDisabled = exerciseProgress.every((ex) => !ex.completed);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <SessionDetailTopBar
        onBack={handleBack}
        secondaryAction={{
          label: "Cancel session",
          onPress: handleCancelSession,
          destructive: true,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom:
            STICKY_BOTTOM_PRIMARY_SCROLL_PADDING + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SessionOverviewSection
          workoutName={sessionData.workout_name}
          startedAt={sessionData.started_at}
          completedCount={completedCount}
          totalExercises={totalExercises}
        />

        <View className="my-4">
          <AppButton
            tone="primary"
            size="lg"
            fullWidth
            label="Add Exercise"
            onPress={() => setShowAddExerciseModal(true)}
            icon={<Ionicons name="add" size={22} color="#ffffff" />}
            className="shadow-lg shadow-primary/25 dark:shadow-primary-dark/20"
          />
        </View>

        <SessionExerciseList
          exercises={sessionData.exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            primaryMuscleGroup: ex.primaryMuscleGroup,
          }))}
          progress={exerciseProgress.map((p) => ({
            completed: p.completed,
            setCount: p.sets.length,
            hasStarted: p.sets.length > 0,
          }))}
          formatExerciseName={formatExerciseName}
          onExercisePress={handleExerciseClick}
          onRemoveExercise={handleRemoveExercise}
        />
      </ScrollView>

      <StickyBottomPrimaryButton
        label="Finish"
        onPress={handleCompleteSession}
        disabled={finishDisabled}
        accessibilityLabel="Finish session"
      />

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
            primaryMuscleGroup: ex.primaryMuscleGroup,
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
