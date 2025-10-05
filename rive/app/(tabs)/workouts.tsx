import React, { useState, useEffect, useCallback } from "react";
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
import AddWorkoutModal from "../components/addworkoutmodal";
import WorkoutDetailsModal from "../components/workoutdetailsmodal";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises: {
    id: number;
    name: string;
    category: string;
  }[];
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
  const fetchWorkoutTemplates = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchWorkoutTemplates();
  }, [user, fetchWorkoutTemplates]);

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
      {/* Enhanced Header */}
      <View
        className="bg-base-200 px-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16, paddingBottom: 20 }}
      >
        <View>
          <Text className="text-2xl font-bold text-base-content">Workouts</Text>
          {userData && (
            <Text className="text-muted mt-1">
              Welcome back, {userData.first_name}! 💪
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View>
          {/* Enhanced Action Cards */}
          <View className="gap-4 mb-6">
            <TouchableOpacity
              className="bg-primary rounded-xl p-6"
              onPress={handleAddNewWorkout}
              style={{
                shadowColor: "#ff4b8c",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-primary-content/20 rounded-xl items-center justify-center">
                  <Ionicons name="add-circle" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-primary-content font-bold text-lg">
                    Create New Workout
                  </Text>
                  <Text className="text-primary-content/80 text-sm mt-1">
                    Build your custom workout template
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-base-200 rounded-xl p-6"
              onPress={handleQuickStart}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center">
                  <Ionicons name="play-circle" size={24} color="#ff4b8c" />
                </View>
                <View className="flex-1">
                  <Text className="text-base-content font-bold text-lg">
                    Quick Start Session
                  </Text>
                  <Text className="text-muted text-sm mt-1">
                    Jump into a workout right away
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>

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
              <View className="bg-base-200 rounded-xl p-8 items-center">
                <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
                  <Ionicons name="barbell-outline" size={40} color="#9ca3af" />
                </View>
                <Text className="text-xl font-bold text-base-content mb-2">
                  No Templates Yet
                </Text>
                <Text className="text-muted text-center mb-6 max-w-xs">
                  Ready to build your first workout template? Let&apos;s create
                  something amazing!
                </Text>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="arrow-up" size={16} color="#ff4b8c" />
                  <Text className="text-sm font-medium text-primary">
                    Tap &quot;Create New Workout&quot; above
                  </Text>
                </View>
              </View>
            ) : (
              <View className="gap-4">
                {workoutTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    className="bg-base-200 rounded-xl p-4"
                    onPress={() => handleViewWorkoutDetails(template.id)}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center gap-3">
                        {/* Workout Icon */}
                        <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center">
                          <Ionicons
                            name="barbell-outline"
                            size={24}
                            color="#ff4b8c"
                          />
                        </View>

                        {/* Template Info */}
                        <View className="flex-1">
                          <Text className="text-base-content font-semibold text-lg">
                            {template.name}
                          </Text>
                          {template.description && (
                            <Text className="text-muted text-sm mt-1">
                              {template.description}
                            </Text>
                          )}
                          <View className="flex-row items-center gap-3 mt-2">
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="list" size={14} color="#9ca3af" />
                              <Text className="text-muted text-xs">
                                {template.exercises.length} exercise
                                {template.exercises.length !== 1 ? "s" : ""}
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="calendar"
                                size={14}
                                color="#9ca3af"
                              />
                              <Text className="text-muted text-xs">
                                {new Date(
                                  template.created_at
                                ).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Arrow */}
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
