import { SquarePen, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import { SetInputs } from "../../types/workout";
import Button from "../ui/button";

type SetListProps = {
  sets: SetInputs[];
  handleUpdateSet: (index: number) => void;
  handleDeleteSet: (index: number) => void;
  exerciseName: string;
};

const SetList = ({
  sets,
  handleUpdateSet,
  handleDeleteSet,
  exerciseName,
}: SetListProps) => {
  const [deleteSetIndex, setDeleteSetIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleConfirmDeleteSet = (): void => {
    if (deleteSetIndex !== null) {
      handleDeleteSet(deleteSetIndex);
      setModalVisible(false);
      setDeleteSetIndex(null);
    }
  };

  const renderItem = ({ item, index }: { item: SetInputs; index: number }) => (
    <View className="rounded bg-base-100 py-3 px-2 my-1 flex-row items-center justify-between">
      <Text className="flex-1 mr-2 text-white">
        <Text className="font-bold">Set {index + 1}:</Text> {item.reps} reps at{" "}
        {item.weight} lbs
        {item.partialReps !== null &&
          item.partialReps > 0 &&
          ` with ${item.partialReps} partial reps`}
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-primary rounded p-2"
          onPress={() => handleUpdateSet(index)}
        >
          <SquarePen color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-error rounded p-2"
          onPress={() => {
            setDeleteSetIndex(index);
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
      <Text className="font-bold text-lg text-white">
        Sets for {exerciseName}:
      </Text>
      <FlatList
        data={sets}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-base-100 rounded p-4 w-11/12">
            <Text className="font-bold text-lg mb-2 text-base-content">
              Delete Set {deleteSetIndex !== null ? deleteSetIndex + 1 : ""}
            </Text>
            <Text className="py-2 text-base-content">
              Are you sure you want to delete this set?
            </Text>
            {deleteSetIndex !== null && sets[deleteSetIndex] && (
              <Text className="mb-2 text-base-content">
                <Text className="font-bold">Set {deleteSetIndex + 1}:</Text>{" "}
                {sets[deleteSetIndex].reps} reps at{" "}
                {sets[deleteSetIndex].weight} lbs
                {sets[deleteSetIndex].partialReps !== null &&
                  sets[deleteSetIndex].partialReps > 0 &&
                  ` with ${sets[deleteSetIndex].partialReps} partial reps`}
              </Text>
            )}
            <View className="flex-row justify-end gap-2 mt-4">
              <Button variant="primary" onPress={() => setModalVisible(false)}>
                Back
              </Button>
              <Button variant="error" onPress={handleConfirmDeleteSet}>
                Delete Set
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SetList;
