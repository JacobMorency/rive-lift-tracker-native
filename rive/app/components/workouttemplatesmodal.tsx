import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";

type WorkoutTemplatesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddNewWorkout?: () => void;
  onViewWorkoutDetails?: (workoutId: string) => void;
};

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercise_count: number;
};

type WorkoutWithExercises = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  workout_exercises: { count: number }[];
};

const WorkoutTemplatesModal = ({
  isOpen,
  onClose,
  onAddNewWorkout,
  onViewWorkoutDetails,
}: WorkoutTemplatesModalProps) => {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutTemplate | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchWorkoutTemplates();
    }
  }, [isOpen, user]);

  const fetchWorkoutTemplates = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("📋 Fetching workout templates...");

      // Fetch workout templates with exercise count
      const { data, error } = await supabase
        .from("workouts")
        .select(
          `
          id,
          name,
          description,
          created_at,
          workout_exercises(count)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workout templates:", error.message);
        return;
      }

      // Transform the data to include exercise count
      const templates =
        data?.map((workout: WorkoutWithExercises) => ({
          id: workout.id,
          name: workout.name,
          description: workout.description,
          created_at: workout.created_at,
          exercise_count: workout.workout_exercises?.[0]?.count || 0,
        })) || [];

      console.log("✅ Workout templates fetched:", templates.length);
      setWorkoutTemplates(templates);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditWorkout = (workout: WorkoutTemplate) => {
    setEditingWorkout(workout);
    setEditName(workout.name);
    setEditDescription(workout.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingWorkout || !editName.trim()) return;

    try {
      const { error } = await supabase
        .from("workouts")
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
        })
        .eq("id", editingWorkout.id);

      if (error) {
        console.error("Error updating workout:", error.message);
        Alert.alert("Error", "Failed to update workout");
        return;
      }

      console.log("✅ Workout updated");

      // Refresh the workout templates list
      await fetchWorkoutTemplates();
      setEditingWorkout(null);
      setEditName("");
      setEditDescription("");
    } catch (error) {
      console.error("Error updating workout:", error);
      Alert.alert("Error", "Failed to update workout");
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
    setEditName("");
    setEditDescription("");
  };

  const handleDeleteWorkout = async (
    workoutId: string,
    workoutName: string
  ) => {
    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${workoutName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // First, check if there are any sessions using this workout
              const { data: sessions, error: sessionsError } = await supabase
                .from("workout_sessions")
                .select("id")
                .eq("workout_id", workoutId);

              if (sessionsError) {
                console.error(
                  "Error checking sessions:",
                  sessionsError.message
                );
                return;
              }

              if (sessions && sessions.length > 0) {
                const sessionCount = sessions.length;
                Alert.alert(
                  "Delete Sessions",
                  `This workout has ${sessionCount} session${
                    sessionCount > 1 ? "s" : ""
                  } associated with it. Deleting the workout will also delete all related sessions. Do you want to continue?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete All",
                      style: "destructive",
                      onPress: async () => {
                        await performDelete(workoutId);
                      },
                    },
                  ]
                );
              } else {
                await performDelete(workoutId);
              }
            } catch (error) {
              console.error("Error deleting workout:", error);
              Alert.alert("Error", "Failed to delete workout");
            }
          },
        },
      ]
    );
  };

  const performDelete = async (workoutId: string) => {
    try {
      // Delete all related sessions first
      const { error: deleteSessionsError } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("workout_id", workoutId);

      if (deleteSessionsError) {
        console.error("Error deleting sessions:", deleteSessionsError.message);
        return;
      }

      // Now delete the workout (this will cascade delete workout_exercises)
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) {
        console.error("Error deleting workout:", error.message);
        Alert.alert("Error", "Failed to delete workout");
        return;
      }

      console.log("✅ Workout deleted");

      // Refresh the workout templates list
      await fetchWorkoutTemplates();
    } catch (error) {
      console.error("Error deleting workout:", error);
      Alert.alert("Error", "Failed to delete workout");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            Workout Templates ({workoutTemplates.length})
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Add New Workout Button */}
        {onAddNewWorkout && (
          <View className="p-4 border-b border-gray-200">
            <TouchableOpacity
              className="w-full py-3 rounded-lg bg-blue-500"
              onPress={onAddNewWorkout}
            >
              <Text className="text-white text-center font-medium">
                ➕ Add New Workout
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <ScrollView className="flex-1">
          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" />
              <Text className="text-gray-600 mt-2">Loading workouts...</Text>
            </View>
          ) : workoutTemplates.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8 px-4">
              <Text className="text-6xl mb-4">🏋️</Text>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No Workout Templates
              </Text>
              <Text className="text-gray-600 text-center">
                Create your first workout template to get started
              </Text>
            </View>
          ) : (
            <View className="p-4 space-y-2">
              {workoutTemplates.map((workout) => (
                <View
                  key={workout.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <TouchableOpacity
                    onPress={() => onViewWorkoutDetails?.(workout.id)}
                    className="flex-1"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-medium text-gray-900">
                          {workout.name}
                        </Text>
                        {workout.description && (
                          <Text className="text-sm text-gray-600 mt-1">
                            {workout.description}
                          </Text>
                        )}
                        <Text className="text-xs text-gray-500 mt-1">
                          {workout.exercise_count} exercises
                        </Text>
                      </View>
                      <View className="flex-row space-x-2">
                        <TouchableOpacity
                          className="px-3 py-1 bg-green-100 rounded"
                          onPress={() => onViewWorkoutDetails?.(workout.id)}
                        >
                          <Text className="text-green-600 text-sm">View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="px-3 py-1 bg-blue-100 rounded"
                          onPress={() => handleEditWorkout(workout)}
                        >
                          <Text className="text-blue-600 text-sm">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="px-3 py-1 bg-red-100 rounded"
                          onPress={() =>
                            handleDeleteWorkout(workout.id, workout.name)
                          }
                        >
                          <Text className="text-red-600 text-sm">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Edit Modal */}
        {editingWorkout && (
          <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
            <View className="bg-white rounded-lg p-6 m-4 w-full max-w-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Edit Workout Template
              </Text>

              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Workout Name
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter workout name"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 h-20"
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="Enter workout description"
                    multiline
                  />
                </View>
              </View>

              <View className="flex-row space-x-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-2 rounded-lg bg-gray-500"
                  onPress={handleCancelEdit}
                >
                  <Text className="text-white text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-lg ${
                    !editName.trim() ? "bg-gray-400" : "bg-blue-500"
                  }`}
                  onPress={handleSaveEdit}
                  disabled={!editName.trim()}
                >
                  <Text className="text-white text-center">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default WorkoutTemplatesModal;
