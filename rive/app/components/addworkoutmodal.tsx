import React, { useState, useRef, useEffect } from "react";
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
  const [errors, setErrors] = useState({ workoutName: "", description: "" });
  const { user } = useAuth();
  const workoutNameRef = useRef<TextInput>(null);

  // Auto-focus workout name input when modal opens
  useEffect(() => {
    if (isOpen && currentStep === "create-workout") {
      setTimeout(() => {
        workoutNameRef.current?.focus();
      }, 100);
    }
  }, [isOpen, currentStep]);

  const validateForm = () => {
    const newErrors = { workoutName: "", description: "" };

    if (!workoutName.trim()) {
      newErrors.workoutName = "Workout name is required";
    } else if (workoutName.trim().length < 2) {
      newErrors.workoutName = "Workout name must be at least 2 characters";
    }

    if (description.trim().length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return !newErrors.workoutName && !newErrors.description;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
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
    setErrors({ workoutName: "", description: "" });
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

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-base-100"
      >
        {currentStep === "create-workout" ? (
          <View className="flex-1">
            {/* Enhanced Header */}
            <View className="bg-base-200 px-4 py-4 border-b border-base-300">
              <View className="flex-row items-center justify-between mb-3">
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-10 h-10 items-center justify-center rounded-full bg-base-300"
                >
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>

                <Text className="text-xl font-bold text-base-content">
                  New Workout
                </Text>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading || !workoutName.trim()}
                  className={`w-10 h-10 items-center justify-center rounded-full ${
                    loading || !workoutName.trim()
                      ? "bg-base-300"
                      : "bg-primary"
                  }`}
                  style={{
                    shadowColor:
                      loading || !workoutName.trim()
                        ? "transparent"
                        : "#ff4b8c",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={
                      loading || !workoutName.trim() ? "#9ca3af" : "#ffffff"
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Progress Indicator */}
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: "50%" }}
                  />
                </View>
                <Text className="text-xs text-muted ml-2">Step 1 of 2</Text>
              </View>
            </View>

            {/* Enhanced Form */}
            <ScrollView
              className="flex-1 p-6"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="gap-6">
                {/* Workout Name Field */}
                <View>
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="w-8 h-8 bg-primary/20 rounded-lg items-center justify-center">
                      <Ionicons name="fitness" size={16} color="#ff4b8c" />
                    </View>
                    <Text className="text-lg font-semibold text-base-content">
                      Workout Name
                    </Text>
                  </View>
                  <TextInput
                    ref={workoutNameRef}
                    className={`border-2 rounded-xl px-4 py-3 text-base-content bg-base-200 text-lg ${
                      errors.workoutName ? "border-error" : "border-base-300"
                    }`}
                    placeholder="e.g., Upper Body Strength"
                    placeholderTextColor="#9ca3af"
                    value={workoutName}
                    onChangeText={(text) => {
                      setWorkoutName(text);
                      if (errors.workoutName) {
                        setErrors((prev) => ({ ...prev, workoutName: "" }));
                      }
                    }}
                    maxLength={50}
                    returnKeyType="next"
                  />
                  <View className="flex-row items-center justify-between mt-2">
                    {errors.workoutName ? (
                      <Text className="text-error text-sm">
                        {errors.workoutName}
                      </Text>
                    ) : (
                      <Text className="text-muted text-sm">
                        Give your workout a memorable name
                      </Text>
                    )}
                    <Text className="text-muted text-sm">
                      {workoutName.length}/50
                    </Text>
                  </View>
                </View>

                {/* Description Field */}
                <View>
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="w-8 h-8 bg-warning/20 rounded-lg items-center justify-center">
                      <Ionicons
                        name="document-text"
                        size={16}
                        color="#f59e0b"
                      />
                    </View>
                    <Text className="text-lg font-semibold text-base-content">
                      Description
                    </Text>
                    <Text className="text-sm text-muted">(Optional)</Text>
                  </View>
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-3 text-base-content bg-base-200 text-base min-h-[100px] ${
                      errors.description ? "border-error" : "border-base-300"
                    }`}
                    placeholder="Describe your workout goals, focus areas, or any special notes..."
                    placeholderTextColor="#9ca3af"
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) {
                        setErrors((prev) => ({ ...prev, description: "" }));
                      }
                    }}
                    multiline
                    textAlignVertical="top"
                    maxLength={200}
                    returnKeyType="done"
                  />
                  <View className="flex-row items-center justify-between mt-2">
                    {errors.description ? (
                      <Text className="text-error text-sm">
                        {errors.description}
                      </Text>
                    ) : (
                      <Text className="text-muted text-sm">
                        Add details about your workout
                      </Text>
                    )}
                    <Text className="text-muted text-sm">
                      {description.length}/200
                    </Text>
                  </View>
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
