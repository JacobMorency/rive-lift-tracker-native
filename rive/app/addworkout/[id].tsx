import { SafeAreaView } from "react-native-safe-area-context";
import AddWorkoutForm from "../../components/addworkoutform";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

const AddWorkoutPage = () => {
  const { id, edit } = useLocalSearchParams();
  const workoutId = Array.isArray(id) ? id[0] : id;
  const isEditing = edit === "true";

  return (
    <SafeAreaView className="bg-base-100 flex-1 px-8">
      <View>
        <Text className="text-primary-content text-3xl font-bold my-4">
          Add Workout
        </Text>
      </View>
      <AddWorkoutForm workoutId={workoutId} isEditing={isEditing} />
    </SafeAreaView>
  );
};

export default AddWorkoutPage;
