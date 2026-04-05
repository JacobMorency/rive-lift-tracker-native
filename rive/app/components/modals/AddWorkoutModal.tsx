import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import ExerciseSelector from "../ExerciseSelector";
import CreateWorkoutForm from "../workout/CreateWorkoutForm";

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
        className="flex-1 bg-white dark:bg-zinc-900"
      >
        {currentStep === "create-workout" ? (
          <CreateWorkoutForm
            workoutName={workoutName}
            description={description}
            onClose={handleClose}
            errors={errors}
            loading={loading}
            onWorkoutNameChange={(text) => {
              setWorkoutName(text);
              if (errors.workoutName) {
                setErrors((prev) => ({ ...prev, workoutName: "" }));
              }
            }}
            onDescriptionChange={(text) => {
              setDescription(text);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            onSubmit={handleSubmit}
            workoutNameRef={workoutNameRef}
          />
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
