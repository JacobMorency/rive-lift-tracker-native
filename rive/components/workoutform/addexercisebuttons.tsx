import { View } from "react-native";
import Button from "../ui/button";
import type { SetInputs } from "@/types/workout";

type AddExerciseButtonProps = {
  handleAddExerciseToWorkout: () => void;
  isSetUpdating: boolean;
  sets: SetInputs[];
  isExerciseUpdating: boolean;
};

const AddExerciseButton = ({
  handleAddExerciseToWorkout,
  isSetUpdating,
  sets,
  isExerciseUpdating,
}: AddExerciseButtonProps) => {
  const isDisabled = sets.length === 0 || isSetUpdating;
  const buttonLabel = isExerciseUpdating
    ? "Update Exercise"
    : "Add Exercise to Workout";

  return (
    <View>
      <Button
        onPress={handleAddExerciseToWorkout}
        disabled={isDisabled}
        variant="primary"
      >
        {buttonLabel}
      </Button>
    </View>
  );
};

export default AddExerciseButton;
