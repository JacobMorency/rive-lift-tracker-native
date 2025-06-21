import { SquarePen, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import { ExercisesInWorkout } from "@/types/workout";
import Button from "../ui/button";

type CompletedExerciseListProps = {
  exercisesInWorkout: ExercisesInWorkout[];
  handleDeleteExercise: (index: number) => void;
  handleUpdateExercise: (index: number) => void;
};

const CompletedExerciseList = ({
  exercisesInWorkout,
  handleDeleteExercise,
  handleUpdateExercise,
}: CompletedExerciseListProps) => {
  const [deleteExerciseIndex, setDeleteExerciseIndex] = useState<number | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleConfirmDeleteExercise = (): void => {
    if (deleteExerciseIndex !== null) {
      handleDeleteExercise(deleteExerciseIndex);
      setModalVisible(false);
      setDeleteExerciseIndex(null);
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: ExercisesInWorkout;
    index: number;
  }) => (
    <View className="rounded bg-base-100 py-3 px-2 my-1 flex-row items-center justify-between">
      <Text className="flex-1 mr-2 text-white">{item.name}</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-primary rounded p-2"
          onPress={() => handleUpdateExercise(index)}
        >
          <SquarePen color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-error rounded p-2"
          onPress={() => {
            setDeleteExerciseIndex(index);
            setModalVisible(true);
          }}
        >
          <Trash2 color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      <Text className="font-bold text-lg text-white mb-2">
        Exercises Completed This Workout:
      </Text>
      {exercisesInWorkout.length > 0 ? (
        <FlatList
          data={exercisesInWorkout}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `exercise-${index}`
          }
        />
      ) : (
        <Text className="text-base-content">No exercises completed yet.</Text>
      )}

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-base-100 rounded p-4 w-11/12">
            <Text className="font-bold text-lg mb-2 text-base-content">
              Remove Exercise
            </Text>
            <Text className="py-2 text-base-content">
              Are you sure you want to remove this exercise?
            </Text>
            {deleteExerciseIndex !== null &&
              exercisesInWorkout[deleteExerciseIndex] && (
                <Text className="mb-2 text-base-content">
                  <Text className="font-bold">Exercise:</Text>{" "}
                  {exercisesInWorkout[deleteExerciseIndex].name}
                </Text>
              )}
            <View className="flex-row justify-end gap-2 mt-4">
              <Button variant="primary" onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button variant="error" onPress={handleConfirmDeleteExercise}>
                Remove
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CompletedExerciseList;
