import { NullableNumber } from "../../types/workout";
import { View } from "react-native";
import Button from "../ui/button";

export type AddSetButtonProps = {
  isSetUpdating: boolean;
  handleAddSet: () => void;
  handleSaveUpdatedSet: () => void;
  cancelUpdateSet: () => void;
  updateSetIndex: NullableNumber;
};

const AddSetButtons = ({
  isSetUpdating,
  handleAddSet,
  handleSaveUpdatedSet,
  cancelUpdateSet,
  updateSetIndex,
}: AddSetButtonProps) => {
  return (
    <View className="w-full">
      {!isSetUpdating && (
        <Button
          onPress={handleAddSet}
          disabled={isSetUpdating}
          variant="primary"
        >
          Add Set
        </Button>
      )}
      {isSetUpdating && (
        <View className="flex flex-col gap-2">
          <Button onPress={handleSaveUpdatedSet} variant="primary">
            {updateSetIndex !== null
              ? `Update Set ${updateSetIndex + 1}`
              : "Update Set"}
          </Button>
          <Button onPress={cancelUpdateSet} variant="error">
            Cancel
          </Button>
        </View>
      )}
    </View>
  );
};

export default AddSetButtons;
