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
import { Ionicons } from "@expo/vector-icons";

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
      // Only add exercises if any are selected
      if (selectedExercises.length > 0) {
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
      } else {
        console.log("✅ Workout template created without exercises");
      }

      handleClose();
    } catch (error) {
      console.error("Error adding exercises:", error);
      Alert.alert("Error", "Failed to add exercises");
    }
  };

  const handleExercisesComplete = () => {
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
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-base-content">
                New Workout
              </Text>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || !workoutName.trim()}
                className={`w-8 h-8 items-center justify-center rounded-full ${
                  loading || !workoutName.trim() ? "bg-base-300" : "bg-primary"
                }`}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={loading || !workoutName.trim() ? "#9ca3af" : "#ffffff"}
                />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              className="flex-1 p-4"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-base-content mb-1">
                    Workout Name
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
                    Description
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
          </View>
        ) : (
          <ExerciseSelector
            onExerciseSelect={handleExerciseSelect}
            onClose={handleClose}
            title="Add Exercises to Workout"
            confirmText="Add to Workout"
            showCloseButton={true}
            workoutName={workoutName}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddWorkoutModal;
