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

  const handleExercisesComplete = () => {
    Alert.alert("Success", "Workout template saved successfully!");
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        {currentStep === "create-workout" ? (
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Add New Workout
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-blue-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView className="flex-1 p-4">
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Workout Name *
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter workout name"
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    maxLength={50}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 h-20"
                    placeholder="Enter workout description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    maxLength={200}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Buttons */}
            <View className="p-4 border-t border-gray-200">
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg bg-gray-500"
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text className="text-white text-center font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ${
                    loading || !workoutName.trim()
                      ? "bg-gray-400"
                      : "bg-blue-500"
                  }`}
                  onPress={handleSubmit}
                  disabled={loading || !workoutName.trim()}
                >
                  <Text className="text-white text-center font-medium">
                    {loading ? "Creating..." : "Create"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Add Exercises
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-blue-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Placeholder for exercise selection */}
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Exercise Selection
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Exercise selection functionality will be implemented next. For
                now, you can complete the workout creation.
              </Text>
              <TouchableOpacity
                className="w-full py-3 rounded-lg bg-blue-500"
                onPress={handleExercisesComplete}
              >
                <Text className="text-white text-center font-medium">
                  Complete Workout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddWorkoutModal;
