import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAuth } from "../../context/authcontext";
import { supabase } from "../../lib/supabaseClient";
import AddWorkoutModal from "../addworkoutmodal";
import WorkoutDetailsModal from "../workoutdetailsmodal";
import Card from "../ui/Card";
import AppText from "../ui/AppText";
import AppCard from "../ui/AppCard";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises: {
    id: number;
    name: string;
    primaryMuscleGroup?: string;
  }[];
  lastUsedDate?: string | null;
  estimatedTime?: number; // in minutes
  averageDuration?: number; // in minutes, from historical data
};

type WorkoutVaultListProps = {
  onTemplateSelect?: (templateId: string) => void;
};

export default function WorkoutVaultList({
  onTemplateSelect,
}: WorkoutVaultListProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    [],
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
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workout templates:", error);
        return;
      }

      // Get all exercise IDs from all templates
      const allExerciseIds = [
        ...new Set(
          data
            ?.flatMap(
              (workout) =>
                workout.workout_exercises?.map(
                  (we: any) => we.exercise_library?.id,
                ) || [],
            )
            .filter((id): id is number => id !== undefined) || [],
        ),
      ];

      // Fetch muscle groups for all exercises
      const { getExercisesWithMuscleGroups } = await import(
        "../../lib/muscleGroupUtils"
      );
      const muscleGroupMap = await getExercisesWithMuscleGroups(allExerciseIds);

      const workoutIds = data?.map((w) => w.id) || [];

      // Fetch last used dates and average durations for each workout
      let lastUsedMap = new Map<string, string>();
      let averageDurationMap = new Map<string, number>();

      if (workoutIds.length > 0) {
        // Get last used date for each workout
        const { data: lastUsedData } = await supabase
          .from("workout_sessions")
          .select("workout_id, started_at, ended_at")
          .eq("user_id", user.id)
          .in("workout_id", workoutIds)
          .order("started_at", { ascending: false });

        if (lastUsedData) {
          // Group by workout_id to get most recent
          const workoutSessions = new Map<string, any>();
          lastUsedData.forEach((session) => {
            if (!session.workout_id) return;
            if (!workoutSessions.has(session.workout_id)) {
              workoutSessions.set(session.workout_id, []);
            }
            workoutSessions.get(session.workout_id)!.push(session);
          });

          // Get most recent date per workout
          workoutSessions.forEach((sessions, workoutId) => {
            if (sessions.length > 0) {
              lastUsedMap.set(workoutId, sessions[0].started_at);
            }
          });

          // Calculate average duration per workout
          workoutSessions.forEach((sessions, workoutId) => {
            const completedSessions = sessions.filter(
              (s: any) => s.started_at && s.ended_at,
            );
            if (completedSessions.length > 0) {
              const totalDuration = completedSessions.reduce(
                (sum: number, s: any) => {
                  const start = new Date(s.started_at);
                  const end = new Date(s.ended_at);
                  return sum + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
                },
                0,
              );
              averageDurationMap.set(
                workoutId,
                Math.round(totalDuration / completedSessions.length),
              );
            }
          });
        }
      }

      const templates =
        data?.map((workout) => {
          const exerciseCount = workout.workout_exercises?.length || 0;
          const lastUsed = lastUsedMap.get(workout.id);
          const avgDuration = averageDurationMap.get(workout.id);
          // Estimate time: 3-5 min per exercise, or use historical average if available
          const estimatedTime = avgDuration || Math.max(20, exerciseCount * 4);

          return {
            id: workout.id,
            name: workout.name,
            description: workout.description,
            created_at: workout.created_at,
            exercises:
              workout.workout_exercises
                ?.map((we: any) => {
                  const exercise = we.exercise_library;
                  if (!exercise) return null;
                  const muscleGroups = muscleGroupMap.get(exercise.id) || [];
                  const primaryMuscleGroup =
                    muscleGroups.find((mg) => mg.is_primary)?.name ||
                    muscleGroups[0]?.name;
                  return {
                    id: exercise.id,
                    name: exercise.name,
                    primaryMuscleGroup,
                  };
                })
                .filter((ex: any) => ex !== null) || [],
            lastUsedDate: lastUsed || null,
            estimatedTime,
            averageDuration: avgDuration,
          };
        }) || [];

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

  const formatLastUsed = (dateString: string | null | undefined): string => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <View>
        <AppText variant="subheader" tone="default">
          Workout Vault
        </AppText>
        <View className="flex-row items-center justify-between mb-4">
          <AppText variant="caption" tone="muted">
            Workout Templates
          </AppText>
          <TouchableOpacity
            onPress={() => setIsAddModalOpen(true)}
            activeOpacity={0.8}
            className="flex-row items-center justify-center"
          >
            <Ionicons
              name="add-circle-outline"
              size={16}
              color={isDark ? "#ff6fa1" : "#ff4b8c"}
              style={{ marginRight: 6 }}
            />
            <AppText variant="caption" tone="primary" className="normal-case">
              Create New
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <Card>
            <View className="flex-row items-center justify-center py-8">
              <ActivityIndicator
                size="small"
                color={isDark ? "#ff6fa1" : "#ff4b8c"}
              />
              <Text className="text-gray-500 dark:text-gray-400 ml-2">
                Loading templates...
              </Text>
            </View>
          </Card>
        ) : (
          <>
            {workoutTemplates.length === 0 ? (
              <Card>
                <View className="items-center py-12">
                  <Ionicons name="barbell-outline" size={48} color="#9ca3af" />
                  <Text className="text-lg font-bold text-zinc-900 dark:text-white mt-4 mb-2">
                    No Templates Yet
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                    Create your first workout template to get started
                  </Text>
                </View>
              </Card>
            ) : (
              <View className="gap-3">
                {workoutTemplates.map((template) => (
                  <AppCard
                    key={template.id}
                    onPress={() => handleViewWorkoutDetails(template.id)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row gap-4">
                        <View>
                          <AppCard surface="alt" radius="tag">
                            <FontAwesome5 name="dumbbell" color="#ff4b8c" />
                          </AppCard>
                        </View>
                        <View>
                          <AppText variant="body" className="font-bold">
                            {template.name}
                          </AppText>
                          <AppText
                            variant="caption"
                            tone="muted"
                            className="normal-case"
                          >
                            {template.exercises.length}{" "}
                            {template.exercises.length === 1
                              ? "Exercise"
                              : "Exercises"}{" "}
                            {template.lastUsedDate
                              ? `• Last: ${formatLastUsed(template.lastUsedDate)}`
                              : ""}
                          </AppText>
                        </View>
                      </View>
                      <View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#a1a1aa"
                        />
                      </View>
                    </View>
                  </AppCard>
                ))}
              </View>
            )}
          </>
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
