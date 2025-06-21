"use client";

import { useState } from "react";
import { View, Text, Modal } from "react-native";
import { useRouter } from "expo-router";
import supabase from "../../lib/supabaseClient";
import { NullableNumber } from "@/types/workout";
import Button from "../ui/button";
import Toast from "react-native-toast-message";

type CardActionButtonsProps = {
  workoutId: NullableNumber;
  onDelete: () => void;
};

const CardActionButtons = ({ workoutId, onDelete }: CardActionButtonsProps) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const confirmDeleteWorkout = async (
    workoutId: NullableNumber
  ): Promise<void> => {
    const { data: workoutExercises, error: fetchError } = await supabase
      .from("workout_exercises")
      .select("id")
      .eq("workout_id", workoutId);

    if (fetchError) {
      Toast.show({
        type: "error",
        text1: "Error loading workout data.",
      });
      return;
    }

    const workoutExerciseIds = workoutExercises.map((exercise) => exercise.id);

    if (workoutExerciseIds.length > 0) {
      const { error: setsError } = await supabase
        .from("sets")
        .delete()
        .in("workout_exercise_id", workoutExerciseIds);

      if (setsError) {
        Toast.show({
          type: "error",
          text1: "Error deleting sets.",
        });
        return;
      }
    }

    const { error: exercisesError } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", workoutId);

    if (exercisesError) {
      Toast.show({
        type: "error",
        text1: "Error deleting exercises.",
      });
      return;
    }

    const { error: workoutsError } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId);

    if (workoutsError) {
      Toast.show({
        type: "error",
        text1: "Error deleting workout.",
      });
      return;
    }

    setModalVisible(false);
    Toast.show({
      type: "success",
      text1: "Workout deleted successfully.",
    });
    onDelete();
  };

  const handleEditWorkout = (workoutId: NullableNumber): void => {
    if (workoutId) {
      router.push(`/addworkout/${workoutId}?edit=true`);
    }
  };

  return (
    <View className="flex-row gap-x-2 mt-2">
      <Button
        className=""
        variant="primary"
        onPress={() => handleEditWorkout(workoutId)}
      >
        Edit
      </Button>
      <Button
        className=""
        variant="error"
        onPress={() => setModalVisible(true)}
      >
        Delete
      </Button>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-base-300 p-6 rounded-lg shadow-lg mx-8">
            <Text className="font-bold text-lg mb-2 text-base-content">
              Delete Workout?
            </Text>
            <Text className="mb-4 text-base-content">
              Are you sure you want to delete this workout? This action cannot
              be undone.
            </Text>
            <View className="flex-row justify-end gap-x-2">
              <Button variant="primary" onPress={() => setModalVisible(false)}>
                Back
              </Button>
              <Button
                variant="error"
                onPress={() => confirmDeleteWorkout(workoutId)}
              >
                Delete Workout
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CardActionButtons;
