"use client";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { View, Text, Pressable } from "react-native";
import ExerciseDetails from "../../components/workouthistory/exercisedetails";
import CardActionButtons from "../../components/workouthistory/cardactionbuttons";
import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import { Workout, Set } from "../../types/workout";

type WorkoutHistoryCardProps = {
  workout: Workout;
};

type WorkoutExercise = {
  id: number;
  exercise_id: number;
  workout_id: number;
};

type WorkoutExerciseWithDetails = {
  id: number;
  exercise_id: number;
  workout_id: number;
  exercise_name: string;
  sets: Set[];
};

const WorkoutHistoryCard = ({ workout }: WorkoutHistoryCardProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [workoutData, setWorkoutData] = useState<WorkoutExerciseWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [deleted, setDeleted] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorkoutInfo = async (): Promise<void> => {
      setLoading(true);

      // Fetch all workout exercises for the given workout
      const { data: workoutExercises, error: workoutExercisesError } =
        await supabase
          .from("workout_exercises")
          .select("*")
          .eq("workout_id", workout.id);

      if (workoutExercisesError) {
        console.error(
          "Error fetching workout data:",
          workoutExercisesError.message
        );
        setLoading(false);
        return;
      }

      // Fetch exercise names and sets for each workout exercise
      const exerciseIds = workoutExercises.map(
        (exercise: WorkoutExercise) => exercise.exercise_id
      );
      const { data: exerciseNames, error: exerciseNamesError } = await supabase
        .from("exercise_library")
        .select("id, name")
        .in("id", exerciseIds);
      if (exerciseNamesError) {
        console.error(
          "Error fetching exercise names:",
          exerciseNamesError.message
        );
        setLoading(false);
        return;
      }

      const workoutExerciseIds = workoutExercises.map(
        (exercise: WorkoutExercise) => exercise.id
      );
      const { data: sets, error: setsError } = await supabase
        .from("sets")
        .select("*")
        .in("workout_exercise_id", workoutExerciseIds);
      if (setsError) {
        console.error("Error fetching sets:", setsError.message);
        setLoading(false);
        return;
      }

      // Combine workout exercises with their names and sets
      const workoutData: WorkoutExerciseWithDetails[] = workoutExercises.map(
        (exercise: WorkoutExercise) => ({
          ...exercise,
          exercise_name:
            exerciseNames.find((name) => name.id === exercise.exercise_id)
              ?.name || "Unknown Exercise",
          sets: sets.filter(
            (set: Set) => set.workout_exercise_id === exercise.id
          ),
        })
      );
      setWorkoutData(workoutData);
      setLoading(false);
    };

    fetchWorkoutInfo();
  }, [workout.id]);

  if (deleted) return null;

  return (
    <View className="mb-3">
      {!loading && (
        <View className="bg-base-300 rounded-md shadow-md w-full p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-base-content">
              {workout.date} - {workoutData.length}{" "}
              {workoutData.length > 1 ? "Exercises" : "Exercise"}
            </Text>
            <Pressable onPress={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? (
                <ChevronUp stroke={"white"} />
              ) : (
                <ChevronDown stroke={"white"} />
              )}
            </Pressable>
          </View>
          {isOpen && (
            <View>
              {workoutData?.length > 0 &&
                workoutData.map((exercise) => (
                  <ExerciseDetails
                    key={exercise.id}
                    exerciseName={exercise.exercise_name}
                    sets={exercise.sets}
                  />
                ))}
              <View className="flex-row justify-end pt-2">
                <CardActionButtons
                  workoutId={workout.id}
                  onDelete={() => setDeleted(true)}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default WorkoutHistoryCard;
