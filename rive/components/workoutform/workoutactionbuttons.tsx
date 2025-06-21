import React, { useState } from "react";
import { View, Text, Modal } from "react-native";
import { ExercisesInWorkout } from "@/types/workout";
import { useRouter } from "expo-router";
import Button from "../ui/button";

type WorkoutActionButtonsProps = {
  handleSaveWorkout: () => void;
  exercisesInWorkout: ExercisesInWorkout[];
  confirmCancelWorkout: () => void;
  isEditing?: boolean;
};

const WorkoutActionButtons = ({
  handleSaveWorkout,
  exercisesInWorkout,
  confirmCancelWorkout,
  isEditing,
}: WorkoutActionButtonsProps) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCancel = () => {
    if (isEditing) {
      router.push("/workouts");
      return;
    }
    confirmCancelWorkout();
    setModalVisible(false);
  };

  return (
    <View>
      <View className="flex gap-2">
        <Button
          className="w-full"
          variant="primary"
          onPress={handleSaveWorkout}
          disabled={exercisesInWorkout.length <= 0}
        >
          Save Workout
        </Button>
        <Button
          className="w-full"
          variant="error"
          onPress={() => setModalVisible(true)}
        >
          {isEditing ? "Cancel Editing" : "Cancel Workout"}
        </Button>
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-base-300 rounded-lg p-6 w-full max-w-md">
            <Text className="font-bold text-lg mb-2 text-base-content">
              {isEditing ? "Cancel Editing?" : "Cancel Workout?"}
            </Text>
            <Text className="mb-4 text-base-content">
              Are you sure you want to cancel{" "}
              {isEditing ? "editing" : "this workout"}? Any unsaved progress
              will be lost.
            </Text>
            <View className="flex-row justify-between">
              <View className="flex-row justify-end gap-x-2 ">
                <Button
                  variant="primary"
                  onPress={() => setModalVisible(false)}
                >
                  Back
                </Button>
                <Button variant="error" onPress={handleCancel}>
                  {isEditing ? "Cancel Editing" : "Cancel Workout"}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WorkoutActionButtons;
