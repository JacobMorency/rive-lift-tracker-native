import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import WorkoutCard from "../components/workoutcard";
import AddWorkoutModal from "../components/addworkoutmodal";
import WorkoutDetailsModal from "../components/workoutdetailsmodal";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises: Array<{
    id: number;
    name: string;
    category: string;
  }>;
};

export default function WorkoutsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch workout templates
  const fetchWorkoutTemplates = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("workouts")
        .select(
          `
          id,
          name,
          description,
          created_at,
          workout_exercises (
            exercise_library (
              id,
              name,
              category
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workout templates:", error);
        return;
      }

      const templates =
        data?.map((workout) => ({
          id: workout.id,
          name: workout.name,
          description: workout.description,
          created_at: workout.created_at,
          exercises:
            workout.workout_exercises?.map((we: any) => we.exercise_library) ||
            [],
        })) || [];

      setWorkoutTemplates(templates);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutTemplates();
  }, [user]);

  const handleAddNewWorkout = () => {
    setIsAddModalOpen(true);
  };

  const handleQuickStart = () => {
    // Navigate to sessions page to start a new session
    router.push("/(tabs)/sessions");
  };

  const handleViewWorkoutDetails = (workoutId: string) => {
    console.log("📋 Opening workout details for ID:", workoutId);
    setSelectedWorkoutId(workoutId);
    setIsDetailsModalOpen(true);
    console.log("📋 Modal state updated - isDetailsModalOpen:", true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWorkoutId(null);
  };

  const handleWorkoutCreated = () => {
    // Refresh templates when a new workout is created
    fetchWorkoutTemplates();
  };

  return (
    <View className="flex-1 bg-base-100">
      {/* Header */}
      <View
        className="bg-base-200 px-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <Text className="text-2xl font-bold text-base-content">Workouts</Text>
        {userData && (
          <Text className="text-muted mt-1">
            Welcome, {userData.first_name} {userData.last_name}!
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View>
          <WorkoutCard
            title="Add New Workout"
            description="Start tracking your progress"
            icon="➕"
            onPress={handleAddNewWorkout}
            variant="primary"
          />

          <View className="mb-5" />

          <WorkoutCard
            title="Quick Start Session"
            description="Start tracking your workout"
            icon="▶️"
            onPress={handleQuickStart}
          />

          <View className="mb-5" />

          {/* Workout Templates Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-base-content">
                My Workout Templates
              </Text>
              <Text className="text-sm text-muted">
                {workoutTemplates.length} template
                {workoutTemplates.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {loading ? (
              <View className="flex-row items-center justify-center py-8">
                <ActivityIndicator size="small" color="#ff4b8c" />
                <Text className="text-muted ml-2">Loading templates...</Text>
              </View>
            ) : workoutTemplates.length === 0 ? (
              <View className="bg-base-200 rounded-lg p-6 items-center">
                <Ionicons name="fitness-outline" size={48} color="#9ca3af" />
                <Text className="text-muted text-center mt-2">
                  No workout templates yet
                </Text>
                <Text className="text-muted text-center text-sm">
                  Create your first template to get started
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {workoutTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    className="bg-base-200 rounded-lg p-4"
                    onPress={() => handleViewWorkoutDetails(template.id)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base-content font-semibold text-lg">
                          {template.name}
                        </Text>
                        {template.description && (
                          <Text className="text-muted text-sm mt-1">
                            {template.description}
                          </Text>
                        )}
                        <Text className="text-muted text-xs mt-2">
                          {template.exercises.length} exercise
                          {template.exercises.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <AddWorkoutModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          handleWorkoutCreated();
        }}
      />

      <WorkoutDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        workoutId={selectedWorkoutId}
      />
    </View>
  );
}
