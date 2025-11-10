import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/authcontext";
import { supabase } from "../../lib/supabaseClient";
import AddWorkoutModal from "../addworkoutmodal";
import WorkoutDetailsModal from "../workoutdetailsmodal";

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

type TemplatesSectionProps = {
  onTemplateSelect?: (templateId: string) => void;
};

export default function TemplatesSection({
  onTemplateSelect,
}: TemplatesSectionProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [loading, setLoading] = useState(false);

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
    if (user) {
      fetchWorkoutTemplates();
    }
  }, [user, fetchWorkoutTemplates]);

  const handleViewWorkoutDetails = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWorkoutId(null);
  };

  const handleWorkoutCreated = () => {
    fetchWorkoutTemplates();
  };

  const handleWorkoutUpdated = () => {
    fetchWorkoutTemplates();
  };

  const handleWorkoutDeleted = () => {
    fetchWorkoutTemplates();
  };

  return (
    <>
      <View className="mb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="barbell" size={24} color="#ff4b8c" />
            <Text className="text-xl font-bold text-base-content">
              Workout Templates
            </Text>
            {workoutTemplates.length > 0 && (
              <View className="bg-primary/20 px-2 py-1 rounded-full">
                <Text className="text-xs font-semibold text-primary">
                  {workoutTemplates.length}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isExpanded && (
          <View>
            {loading ? (
              <View className="flex-row items-center justify-center py-8 bg-base-300 rounded-xl">
                <ActivityIndicator size="small" color="#ff4b8c" />
                <Text className="text-muted ml-2">Loading templates...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  className="bg-primary rounded-xl p-4 mb-4 flex-row items-center justify-center"
                  onPress={() => setIsAddModalOpen(true)}
                  style={{
                    shadowColor: "#ff4b8c",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="add-circle" size={22} color="#ffffff" />
                  <Text className="text-primary-content font-bold text-base ml-2">
                    Create New Workout Template
                  </Text>
                </TouchableOpacity>

                {workoutTemplates.length === 0 ? (
                  <View className="items-center py-12 bg-base-300 rounded-xl">
                    <Ionicons
                      name="barbell-outline"
                      size={48}
                      color="#9ca3af"
                    />
                    <Text className="text-lg font-bold text-base-content mt-4 mb-2">
                      No Templates Yet
                    </Text>
                    <Text className="text-sm text-muted text-center px-4">
                      Create your first workout template to get started
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {workoutTemplates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        className="bg-base-300 rounded-xl p-4"
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
                          <View className="flex-1">
                            <Text className="text-base font-bold text-base-content">
                              {template.name}
                            </Text>
                            {template.description && (
                              <Text className="text-sm text-muted mt-1">
                                {template.description}
                              </Text>
                            )}
                            <View className="flex-row items-center gap-3 mt-2">
                              <View className="flex-row items-center gap-1">
                                <Ionicons name="list" size={14} color="#9ca3af" />
                                <Text className="text-xs text-muted">
                                  {template.exercises.length} exercise
                                  {template.exercises.length !== 1 ? "s" : ""}
                                </Text>
                              </View>
                              <View className="flex-row items-center gap-1">
                                <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                                <Text className="text-xs text-muted">
                                  {new Date(
                                    template.created_at
                                  ).toLocaleDateString()}
                                </Text>
                              </View>
                            </View>
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
              </>
            )}
          </View>
        )}
      </View>

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
        onWorkoutUpdated={handleWorkoutUpdated}
        onWorkoutDeleted={handleWorkoutDeleted}
      />
    </>
  );
}

