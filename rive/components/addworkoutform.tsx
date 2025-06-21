import ExerciseSelector from "./workoutform/exerciseselector";
import SetList from "./workoutform/setlist";
import CompletedExerciseList from "./workoutform/completedexerciselist";
import WorkoutActionButtons from "./workoutform/workoutactionbuttons";
import SetInputForm from "./workoutform/setinputform";
import AddExerciseButton from "./workoutform/addexercisebuttons";
import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import {
  ExercisesInWorkout,
  NullableNumber,
  SetInputs,
} from "../types/workout";
import { View, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

type AddWorkoutFormProps = {
  workoutId: string;
  isEditing?: boolean;
};

type CompletedSet = {
  exerciseId: NullableNumber;
  exerciseName: string;
  sets: SetInputs[];
};

const AddWorkoutForm = ({ workoutId, isEditing }: AddWorkoutFormProps) => {
  const [exerciseName, setExerciseName] = useState<string>("");
  const [exerciseId, setExerciseId] = useState<NullableNumber>(null);
  const [reps, setReps] = useState<NullableNumber>(null);
  const [sets, setSets] = useState<SetInputs[]>([]);
  const [weight, setWeight] = useState<NullableNumber>(null);
  const [partialReps, setPartialReps] = useState<NullableNumber>(null);
  const [exercisesInWorkout, setExercisesInWorkout] = useState<
    ExercisesInWorkout[]
  >([]);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [updateSetIndex, setUpdateSetIndex] = useState<NullableNumber>(null);
  const [isSetUpdating, setIsSetUpdating] = useState<boolean>(false);
  const [updateExerciseIndex, setUpdateExerciseIndex] =
    useState<NullableNumber>(null);
  const [isExerciseUpdating, setIsExerciseUpdating] = useState<boolean>(false);
  const [repsEmpty, setRepsEmpty] = useState<boolean>(false);
  const [weightEmpty, setWeightEmpty] = useState<boolean>(false);
  const [repsInvalid, setRepsInvalid] = useState<boolean>(false);
  const [weightInvalid, setWeightInvalid] = useState<boolean>(false);
  const [partialRepsInvalid, setPartialRepsInvalid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const router = useRouter();

  const handleCompleteWorkout = async (): Promise<void> => {
    await AsyncStorage.removeItem("workoutId");
    await AsyncStorage.removeItem("workoutProgress");
    router.push("/workouts");
  };

  const handleSaveWorkout = async (): Promise<void> => {
    // If editing, delete all sets and workout_exercises first
    if (isEditing) {
      // 1. Fetch all workout_exercise ids for the current workout
      const { data: workoutExercises, error: fetchError } = await supabase
        .from("workout_exercises")
        .select("id")
        .eq("workout_id", workoutId);
      if (fetchError) {
        console.error("Error fetching workout exercises:", fetchError.message);
        return;
      }

      const workoutExerciseIds = workoutExercises.map(
        (exercise) => exercise.id
      );

      // 2. Delete all sets for the current workout_exercise ids
      const { error: deleteSetsError } = await supabase
        .from("sets")
        .delete()
        .in("workout_exercise_id", workoutExerciseIds);
      if (deleteSetsError) {
        console.error("Error deleting sets:", deleteSetsError.message);
        return;
      }
      // 3. Delete all workout_exercises for the current workout
      const { error: deleteExercisesError } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_id", workoutId);
      if (deleteExercisesError) {
        console.error(
          "Error deleting workout exercises:",
          deleteExercisesError.message
        );
        return;
      }
    }

    for (const completedSet of completedSets) {
      const { data: workoutExercisesData, error: exerciseError } =
        await supabase
          .from("workout_exercises")
          .insert([
            {
              exercise_id: completedSet.exerciseId,
              workout_id: workoutId,
              created_at: new Date(),
            },
          ])
          .select("id")
          .single();
      if (exerciseError) {
        console.error(
          "Error adding exercise to workout:",
          exerciseError.message
        );
        Toast.show({
          type: "error",
          text1: "Error saving exercise to workout",
          text2: "Please try again.",
        });
        return;
      }

      const setsData = completedSet.sets.map((set, index) => ({
        workout_exercise_id: workoutExercisesData.id,
        set_number: index + 1,
        weight: set.weight,
        reps: set.reps,
        partial_reps: set.partialReps,
        exercise_name: completedSet.exerciseName,
        workout_id: workoutId,
      }));

      const { error: setsError } = await supabase.from("sets").insert(setsData);
      if (setsError) {
        console.error("Error adding sets to workout:", setsError.message);
        Toast.show({
          type: "error",
          text1: "Error saving sets to workout",
          text2: "Please try again.",
        });
        return;
      }
    }

    const { error } = await supabase
      .from("workouts")
      .update({ is_complete: true })
      .eq("id", workoutId)
      .select();
    if (error) {
      console.error("Error saving workout:", error.message);
      Toast.show({
        type: "error",
        text1: "Error saving workout",
        text2: "Please try again.",
      });
      return;
    }
    Toast.show({
      type: "success",
      text1: "Workout saved successfully!",
    });
    handleCompleteWorkout();
  };

  const handleAddSet = (): void => {
    let hasError = false;
    setRepsEmpty(false);
    setWeightEmpty(false);
    setRepsInvalid(false);
    setWeightInvalid(false);
    setPartialRepsInvalid(false);

    if (!reps) {
      setRepsEmpty(true);
      hasError = true;
    } else if (reps <= 0) {
      setRepsInvalid(true);
      hasError = true;
    }

    if (!weight) {
      setWeightEmpty(true);
      hasError = true;
    } else if (weight <= 0) {
      setWeightInvalid(true);
      hasError = true;
    }

    if (partialReps) {
      if (partialReps < 0) {
        setPartialRepsInvalid(true);
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    if (reps && weight) {
      if (reps > 0 && weight > 0) {
        setSets((prevSets) => [
          ...prevSets,
          {
            exerciseId: exerciseId,
            reps: reps,
            weight: weight,
            partialReps: partialReps || 0, // Default to 0 if partial reps is empty
          },
        ]);
      }
      setReps(null);
      setWeight(null);
      setPartialReps(null);
      Keyboard.dismiss();
    }
  };

  const handleUpdateSet = (index: NullableNumber): void => {
    if (index !== null) {
      const setToUpdate = sets[index];
      setReps(setToUpdate.reps);
      setWeight(setToUpdate.weight);
      setPartialReps(setToUpdate.partialReps);
      setUpdateSetIndex(index);
      setIsSetUpdating(true);
      setUpdateSetIndex(index);
    }
  };

  const handleSaveUpdatedSet = (): void => {
    if (reps === null || weight === null) {
      return;
    }
    const updatedSet = {
      exerciseId: exerciseId,
      reps: reps,
      weight: weight,
      partialReps: partialReps || 0,
    };
    const updatedSets = sets.map((set, index) =>
      index === updateSetIndex ? updatedSet : set
    );
    setSets(updatedSets);
    setIsSetUpdating(false);
    setReps(null);
    setWeight(null);
    setPartialReps(null);
    setUpdateSetIndex(null);
  };

  const handleDeleteSet = (index: NullableNumber): void => {
    const updatedSets = sets.filter((set, i) => i !== index);
    setSets(updatedSets);

    if (updatedSets.length === 0 && isExerciseUpdating) {
      setIsExerciseUpdating(false);
      setUpdateExerciseIndex(null);
      resetFormFields();
      if (updateExerciseIndex !== null) {
        handleDeleteExercise(updateExerciseIndex);
      }
    }
  };

  const handleDeleteExercise = (index: NullableNumber): void => {
    const updatedExercisesInWorkout = exercisesInWorkout.filter(
      (exercise, i) => i !== index
    );
    const updatedCompletedSets = completedSets.filter((set, i) => i !== index);

    setExercisesInWorkout(updatedExercisesInWorkout);
    setCompletedSets(updatedCompletedSets);
  };

  const handleUpdateExercise = (index: NullableNumber): void => {
    if (index !== null) {
      const completedSet = completedSets[index];
      setExerciseName(completedSet.exerciseName);
      setExerciseId(completedSet.exerciseId);
      setSets(
        completedSet.sets.map((set) => ({
          exerciseId: completedSet.exerciseId,
          reps: set.reps,
          weight: set.weight,
          partialReps: set.partialReps || 0, // Default to 0 if partial reps is empty
        }))
      );
      setIsExerciseUpdating(true);
      setUpdateExerciseIndex(index);
    }
  };

  const checkUnsavedChanges = (): boolean => {
    if (reps || weight || (partialReps !== null && partialReps > 0)) {
      return true;
    } else {
      return false;
    }
  };

  const handleAddExerciseToWorkout = (): void => {
    if (!checkUnsavedChanges()) {
      handleConfirmAddExerciseToWorkout();
    } else {
      return;
    }
  };

  const handleConfirmAddExerciseToWorkout = async (): Promise<void> => {
    if (isExerciseUpdating && updateExerciseIndex !== null) {
      // Replaces the old completedSet with a new one with updates
      const updatedCompletedSets = [...completedSets];

      updatedCompletedSets[updateExerciseIndex] = {
        exerciseId,
        exerciseName,
        sets: sets.map((set) => ({
          exerciseId,
          reps: set.reps,
          weight: set.weight,
          partialReps: set.partialReps || 0,
        })),
      };
      setCompletedSets(updatedCompletedSets);

      const updatedExercisesInWorkout = [...exercisesInWorkout];
      updatedExercisesInWorkout[updateExerciseIndex] = {
        id: exerciseId,
        name: exerciseName,
      };
      setExercisesInWorkout(updatedExercisesInWorkout);
    } else {
      setCompletedSets((prev) => [
        ...prev,
        {
          exerciseId: exerciseId,
          exerciseName: exerciseName,
          sets: sets,
        },
      ]);
      setExercisesInWorkout((prev) => [
        ...prev,
        { id: exerciseId, name: exerciseName },
      ]);
    }
    setIsExerciseUpdating(false);
    setUpdateExerciseIndex(null);
    setSets([]);
    resetFormFields();
  };

  const resetFormFields = (): void => {
    setExerciseName("");
    setReps(null);
    setWeight(null);
    setPartialReps(null);
  };

  const cancelUpdateSet = (): void => {
    setIsSetUpdating(false);
    setReps(null);
    setWeight(null);
    setPartialReps(null);
  };

  const confirmCancelWorkout = async (): Promise<void> => {
    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId);

    if (error) {
      console.error("Error deleting workout:", error.message);
    } else {
      console.log("Workout deleted successfully.");
    }
    handleCompleteWorkout();
  };

  // Get previous workout progress from local storage so its persisted upon refresh
  useEffect(() => {
    if (isEditing) return;
    const loadProgress = async () => {
      const savedProgress = await AsyncStorage.getItem("workoutProgress");
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          if (progress.completedSets) {
            setCompletedSets(progress.completedSets);
            const derivedExercises = progress.completedSets.map(
              (ex: CompletedSet) => ({
                id: ex.exerciseId,
                name: ex.exerciseName,
              })
            );
            setExercisesInWorkout(derivedExercises);
          }
          if (progress.exerciseId) {
            setExerciseId(progress.exerciseId);
          }
          if (progress.exerciseName) {
            setExerciseName(progress.exerciseName);
          }
          if (progress.reps) {
            setReps(progress.reps);
          }
          if (progress.weight) {
            setWeight(progress.weight);
          }
          if (progress.partialReps) {
            setPartialReps(progress.partialReps);
          }
          if (progress.sets) {
            setSets(progress.sets);
          }
        } catch (error) {
          console.error("Error parsing saved progress:", error);
          return;
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    loadProgress();
  }, [isInitialized, isEditing]);

  // Save the current workout progress to local storage so that it can be retrieved upon refresh or page change
  useEffect(() => {
    if (isInitialized) {
      const progress = {
        completedSets,
        exerciseId,
        exerciseName,
        exercisesInWorkout,
        reps,
        weight,
        partialReps,
        sets,
      };
      AsyncStorage.setItem("workoutProgress", JSON.stringify(progress));
    }
  }, [
    completedSets,
    exerciseId,
    exerciseName,
    exercisesInWorkout,
    reps,
    weight,
    partialReps,
    sets,
    isInitialized,
  ]);

  // If the workout is being edited, fetch the existing workout data
  useEffect(() => {
    if (!isEditing || !workoutId) return;

    const loadCompletedWorkout = async (): Promise<void> => {
      setLoading(true);
      const { data: workoutExercises, error: workoutExercisesError } =
        await supabase
          .from("workout_exercises")
          .select("*")
          .eq("workout_id", workoutId);

      if (workoutExercisesError) {
        console.error(
          "Error fetching workout exercises:",
          workoutExercisesError.message
        );
        setLoading(false);
        return;
      }

      const exerciseIds = workoutExercises.map(
        (exercise) => exercise.exercise_id
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
        (exercise) => exercise.id
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

      const completedSetsData: CompletedSet[] = workoutExercises.map(
        (exercise) => ({
          exerciseId: exercise.exercise_id,
          exerciseName:
            exerciseNames.find((e) => e.id === exercise.exercise_id)?.name ||
            "",
          sets: sets
            .filter((set) => set.workout_exercise_id === exercise.id)
            .map((set) => ({
              exerciseId: exercise.exercise_id,
              reps: set.reps,
              weight: set.weight,
              partialReps: set.partial_reps || 0,
            })),
        })
      );

      setCompletedSets(completedSetsData);
      setExercisesInWorkout(
        completedSetsData.map((cs) => ({
          id: cs.exerciseId,
          name: cs.exerciseName,
        }))
      );
      setLoading(false);
    };
    loadCompletedWorkout();
  }, [isEditing, workoutId]);

  //   if (loading) {
  //     return <Text className="text-primary-content">Loading...</Text>;
  //   }

  return (
    <View className="flex-1 bg-base-100 gap-4">
      <View className="bg-base-300 rounded-lg p-4">
        <ExerciseSelector
          exerciseName={exerciseName}
          setExerciseName={setExerciseName}
          setExerciseId={setExerciseId}
          isSetUpdating={isSetUpdating}
          isSetsEmpty={sets.length === 0}
          exercisesInWorkout={exercisesInWorkout}
        />
      </View>

      {exerciseName && (
        <View className="bg-base-300 rounded-lg p-4">
          <SetInputForm
            reps={reps}
            weight={weight}
            partialReps={partialReps}
            setReps={setReps}
            setWeight={setWeight}
            setPartialReps={setPartialReps}
            repsEmpty={repsEmpty}
            weightEmpty={weightEmpty}
            partialRepsInvalid={partialRepsInvalid}
            weightInvalid={weightInvalid}
            repsInvalid={repsInvalid}
            isSetUpdating={isSetUpdating}
            handleAddSet={handleAddSet}
            handleSaveUpdatedSet={handleSaveUpdatedSet}
            cancelUpdateSet={cancelUpdateSet}
            updateSetIndex={updateSetIndex}
          />
        </View>
      )}

      {sets.length > 0 && (
        <View className="bg-base-300 rounded-lg p-4 gap-2">
          <SetList
            sets={sets}
            handleUpdateSet={handleUpdateSet}
            handleDeleteSet={handleDeleteSet}
            exerciseName={exerciseName}
          />
          <AddExerciseButton
            handleAddExerciseToWorkout={handleAddExerciseToWorkout}
            isSetUpdating={isSetUpdating}
            sets={sets}
            isExerciseUpdating={isExerciseUpdating}
          />
        </View>
      )}

      <View className="bg-base-300 rounded-lg p-4 gap-2">
        <CompletedExerciseList
          exercisesInWorkout={exercisesInWorkout}
          handleDeleteExercise={handleDeleteExercise}
          handleUpdateExercise={handleUpdateExercise}
        />
        <WorkoutActionButtons
          handleSaveWorkout={handleSaveWorkout}
          exercisesInWorkout={exercisesInWorkout}
          confirmCancelWorkout={confirmCancelWorkout}
          isEditing={isEditing}
        />
      </View>
    </View>
  );
};

export default AddWorkoutForm;
