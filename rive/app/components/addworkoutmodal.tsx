import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import ExerciseSelector from "./exerciseselector";

type AddWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ModalStep = "create-workout" | "add-exercises";

const AddWorkoutModal = ({ isOpen, onClose }: AddWorkoutModalProps) => {
  const [workoutName, setWorkoutName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ModalStep>("create-workout");
  const [createdWorkoutId, setCreatedWorkoutId] = useState("");
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Error", "Please enter a workout name");
      return;
    }

    if (!user) {
      Alert.alert("Error", "No user found");
      return;
    }

    setLoading(true);

    try {
      console.log("💪 Creating workout...");

      const { data, error } = await supabase
        .from("workouts")
        .insert([
          {
            name: workoutName.trim(),
            description: description.trim() || null,
            user_id: user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating workout:", error.message);
        Alert.alert("Error", "Failed to create workout");
        return;
      }

      console.log("✅ Workout created:", data);

      // Move to exercise selection step
      setCreatedWorkoutId(data.id);
      setCurrentStep("add-exercises");
      setLoading(false);
    } catch (error) {
      console.error("Error creating workout:", error);
      Alert.alert("Error", "Failed to create workout");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWorkoutName("");
    setDescription("");
    setCurrentStep("create-workout");
    setCreatedWorkoutId("");
    onClose();
  };

  const handleExerciseSelect = async (selectedExercises: any[]) => {
    if (!createdWorkoutId) return;

    try {
      // Add selected exercises to the workout
      const exercisesToAdd = selectedExercises.map((exercise, index) => ({
        workout_id: createdWorkoutId,
        exercise_id: exercise.id,
        order_index: index,
      }));

      const { error } = await supabase
        .from("workout_exercises")
        .insert(exercisesToAdd);

      if (error) {
        console.error("Error adding exercises:", error.message);
        Alert.alert("Error", "Failed to add exercises");
        return;
      }

      console.log("✅ Exercises added to workout");
      Alert.alert(
        "Success",
        `Workout template saved with ${selectedExercises.length} exercises!`
      );
      handleClose();
    } catch (error) {
      console.error("Error adding exercises:", error);
      Alert.alert("Error", "Failed to add exercises");
    }
  };

  const handleExercisesComplete = () => {
    Alert.alert("Success", "Workout template saved successfully!");
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-base-100"
      >
        {currentStep === "create-workout" ? (
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-base-300">
              <Text className="text-lg font-semibold text-base-content">
                Add New Workout
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-primary text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView className="flex-1 p-4">
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-base-content mb-1">
                    Workout Name *
                  </Text>
                  <TextInput
                    className="border border-base-200 rounded-lg px-3 py-2 text-base-content bg-base-200"
                    placeholder="Enter workout name"
                    placeholderTextColor="#9ca3af"
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    maxLength={50}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-base-content mb-1">
                    Description (Optional)
                  </Text>
                  <TextInput
                    className="border border-base-200 rounded-lg px-3 py-2 text-base-content bg-base-200 h-20"
                    placeholder="Enter workout description"
                    placeholderTextColor="#9ca3af"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    maxLength={200}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Buttons */}
            <View className="p-4 border-t border-base-300">
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg bg-neutral"
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text className="text-neutral-content text-center font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ${
                    loading || !workoutName.trim() ? "bg-neutral" : "bg-primary"
                  }`}
                  onPress={handleSubmit}
                  disabled={loading || !workoutName.trim()}
                >
                  <Text className="text-primary-content text-center font-medium">
                    {loading ? "Creating..." : "Create"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <ExerciseSelector
            onExerciseSelect={handleExerciseSelect}
            onClose={handleClose}
            title="Add Exercises to Workout"
            confirmText="Add to Workout"
            showCloseButton={true}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddWorkoutModal;
