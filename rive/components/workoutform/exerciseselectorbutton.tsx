import { Exercise } from "@/types/workout";
import { Star, StarOff } from "lucide-react-native";
import { TouchableOpacity, Text } from "react-native";

type ExerciseSelectorButtonProps = {
  exercise: Exercise;
  handleSelect: (exercise: Exercise) => void;
  addToRecent: (exercise: Exercise) => void;
  isFavorite: boolean;
  onToggleFavorite: (exercise: Exercise) => void;
};

const ExerciseSelectorButton = ({
  exercise,
  handleSelect,
  addToRecent,
  isFavorite,
  onToggleFavorite,
}: ExerciseSelectorButtonProps) => {
  const handlePress = () => {
    handleSelect(exercise);
    addToRecent(exercise);
    // Modal closing should be handled by parent
  };

  return (
    <TouchableOpacity
      className="bg-primary py-4 my-1 px-4 rounded-md w-full flex-row justify-between items-center"
      onPress={handlePress}
    >
      <Text className="text-primary-content font-bold text-xl">
        {exercise.name}
      </Text>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation?.(); // Prevent bubbling to outer TouchableOpacity
          onToggleFavorite(exercise);
        }}
      >
        {isFavorite ? (
          <Star size={20} color="#facc15" fill="#facc15" />
        ) : (
          <StarOff size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ExerciseSelectorButton;
