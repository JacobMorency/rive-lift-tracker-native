import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import supabase from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { NullableNumber } from "../../types/workout";
import Button from "../../components/ui/button";
import WorkoutHistory from "../../components/workouthistory";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WorkoutsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [workoutInProgress, setWorkoutInProgress] = useState<boolean>(false);
  const [workoutId, setWorkoutId] = useState<NullableNumber>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const handleStartNewWorkout = async (): Promise<void> => {
    setIsNavigating(true);
    const newWorkoutId = await createNewWorkout();
    if (newWorkoutId) {
      setWorkoutId(newWorkoutId);
      await AsyncStorage.setItem("workoutId", newWorkoutId.toString());
      router.push(`/addworkout/${newWorkoutId}`);
    } else {
      setIsNavigating(false);
    }
  };

  const createNewWorkout = async (): Promise<NullableNumber> => {
    if (user !== null) {
      const { data, error } = await supabase
        .from("workouts")
        .insert([{ user_id: user.id, date: new Date() }])
        .select("id, user_id, date")
        .single();

      if (error) {
        console.error("Error creating new workout:", error.message);
        return null;
      }
      return data?.id;
    }
    return null;
  };

  const handleContinueWorkout = (): void => {
    if (workoutId) {
      router.push(`/addworkout/${workoutId}`);
    }
  };

  useEffect(() => {
    const fetchWorkoutId = async () => {
      const savedWorkoutId = await AsyncStorage.getItem("workoutId");
      if (savedWorkoutId) {
        setWorkoutId(parseInt(savedWorkoutId));
        setWorkoutInProgress(true);
      }
    };
    fetchWorkoutId();
  }, []);

  return (
    <SafeAreaView className="bg-base-100 flex-1 px-4">
      <View>
        <Text className="text-primary-content text-3xl font-bold my-4">
          Workouts
        </Text>
      </View>

      <View className="px-2">
        <View>
          {!workoutInProgress ? (
            <Button
              onPress={handleStartNewWorkout}
              className="w-full"
              variant="primary"
            >
              Start New Workout
            </Button>
          ) : (
            <Button
              onPress={handleContinueWorkout}
              className="w-full"
              variant="primary"
              disabled={isNavigating}
            >
              Continue Previous Workout
            </Button>
          )}
        </View>
        <View>
          <WorkoutHistory />
        </View>
      </View>
    </SafeAreaView>
  );
}
