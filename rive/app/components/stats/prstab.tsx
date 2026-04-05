import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/authcontext";
import AppText from "../ui/AppText";
import AppCard from "../ui/AppCard";
import {
  DateRange,
  getTrackedExercises,
  saveTrackedExercises,
  getTrackedPRData,
  getExerciseProgressData,
  TrackedPR,
  ExerciseProgressData,
} from "../../lib/statsUtils";
import ExerciseSelectionModal from "./exerciseselectionmodal";

type PRsTabProps = {
  dateRange: DateRange;
};

export default function PRsTab({ dateRange }: PRsTabProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primary = isDark ? "#ff6fa1" : "#ff4b8c";
  const mutedIcon = isDark ? "#a1a1aa" : "#6b7280";

  const [trackedExercises, setTrackedExercises] = useState<number[]>([]);
  const [trackedPRs, setTrackedPRs] = useState<TrackedPR[]>([]);
  const [exerciseProgressData, setExerciseProgressData] = useState<
    Map<number, ExerciseProgressData>
  >(new Map());
  const [loadingProgress, setLoadingProgress] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTrackedExercises();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && trackedExercises.length > 0) {
      fetchTrackedPRs();
    } else {
      setTrackedPRs([]);
      setLoading(false);
    }
  }, [user?.id, trackedExercises, dateRange]);

  const fetchExerciseProgress = useCallback(
    async (exerciseId: number) => {
      if (!user?.id) return;

      setLoadingProgress((prev) => new Set(prev).add(exerciseId));
      try {
        const progressData = await getExerciseProgressData(
          user.id,
          exerciseId,
          dateRange
        );
        setExerciseProgressData((prev) => {
          const newMap = new Map(prev);
          newMap.set(exerciseId, progressData);
          return newMap;
        });
      } catch (error) {
        console.error(`Error fetching progress for exercise ${exerciseId}:`, error);
      } finally {
        setLoadingProgress((prev) => {
          const newSet = new Set(prev);
          newSet.delete(exerciseId);
          return newSet;
        });
      }
    },
    [user?.id, dateRange]
  );

  useEffect(() => {
    if (expandedExercise && !exerciseProgressData.has(expandedExercise)) {
      fetchExerciseProgress(expandedExercise);
    }
  }, [expandedExercise, exerciseProgressData, fetchExerciseProgress]);

  const fetchTrackedExercises = async () => {
    if (!user?.id) return;

    try {
      const exercises = await getTrackedExercises(user.id);
      setTrackedExercises(exercises);
    } catch (error) {
      console.error("Error fetching tracked exercises:", error);
    }
  };

  const fetchTrackedPRs = async () => {
    if (!user?.id || trackedExercises.length === 0) return;

    try {
      setLoading(true);
      const prs = await getTrackedPRData(user.id, trackedExercises, dateRange);
      setTrackedPRs(prs);
    } catch (error) {
      console.error("Error fetching tracked PRs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrackedExercises = async (exerciseIds: number[]) => {
    if (!user?.id) return;

    try {
      await saveTrackedExercises(user.id, exerciseIds);
      setTrackedExercises(exerciseIds);
    } catch (error) {
      console.error("Error saving tracked exercises:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPRTypeIcon = (type: "weight" | "reps") => {
    switch (type) {
      case "weight":
        return "barbell";
      case "reps":
        return "repeat";
      default:
        return "trophy";
    }
  };

  const getPRTypeColor = (type: "weight" | "reps") => {
    switch (type) {
      case "weight":
        return "#ff4b8c";
      case "reps":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    return "#ff4b8c"; // All badges use primary color
  };

  return (
    <>
      <View className="pb-2">
        {/* Header Section */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="min-w-0 flex-1 pr-3">
              <AppText variant="subheader" tone="default">
                Personal records
              </AppText>
              <AppText variant="body" tone="muted" className="mt-1 normal-case">
                Track your best performances
              </AppText>
            </View>
            <TouchableOpacity
              onPress={() => setIsSelectionModalOpen(true)}
              className="rounded-ds-control bg-primary px-4 py-2 dark:bg-primary-dark"
            >
              <AppText variant="body" tone="inverse" className="font-semibold normal-case">
                Manage
              </AppText>
            </TouchableOpacity>
          </View>

          <AppCard className="p-4" surface="alt">
            <View className="mb-2 flex-row items-center gap-2">
              <Ionicons name="list" size={16} color={primary} />
              <AppText variant="caption" tone="muted" className="normal-case">
                Currently tracking
              </AppText>
            </View>
            <AppText variant="header" tone="default">
              {trackedExercises.length} exercise
              {trackedExercises.length !== 1 ? "s" : ""}
            </AppText>
          </AppCard>
        </View>

        {/* Tracked PRs List */}
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={primary} />
            <AppText variant="body" tone="muted" className="mt-2 normal-case">
              Loading PRs…
            </AppText>
          </View>
        ) : trackedPRs.length > 0 ? (
        <View className="gap-4">
          {trackedPRs.map((pr) => (
            <View
              key={pr.exerciseId}
              className="rounded-ds-card border border-border bg-surface p-6 dark:border-border-dark dark:bg-surface-dark"
            >
              {/* Exercise Header */}
              <TouchableOpacity
                onPress={() =>
                  setExpandedExercise(
                    expandedExercise === pr.exerciseId ? null : pr.exerciseId
                  )
                }
                className="flex-row items-center justify-between mb-4"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {pr.exerciseName}
                    </Text>
                    {pr.primaryMuscleGroup && (
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: getMuscleGroupColor(pr.primaryMuscleGroup) + "20",
                        }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: getMuscleGroupColor(pr.primaryMuscleGroup) }}
                        >
                          {pr.primaryMuscleGroup}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons
                  name={
                    expandedExercise === pr.exerciseId
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color={mutedIcon}
                />
              </TouchableOpacity>

              {/* PR Stats */}
              <View className="gap-3">
                {pr.maxWeight > 0 ? (
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="barbell" size={16} color="#ff4b8c" />
                      <Text className="text-zinc-900 dark:text-white">Max Weight:</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-[#ff4b8c] dark:text-[#ff6fa1]">
                        {pr.maxWeight} lbs × {pr.maxWeightReps} reps
                      </Text>
                      {pr.maxWeightDate && (
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(pr.maxWeightDate)}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : pr.maxReps > 0 ? (
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="repeat" size={16} color="#ff4b8c" />
                      <Text className="text-zinc-900 dark:text-white">Max Reps:</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-[#ff4b8c] dark:text-[#ff6fa1]">
                        {pr.maxReps} reps × {pr.maxRepsWeight} lbs
                      </Text>
                      {pr.maxRepsDate && (
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(pr.maxRepsDate)}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : null}
              </View>

              {/* PR History and Progress Charts (Expandable) */}
              {expandedExercise === pr.exerciseId && (
                <View className="mt-4 border-t border-border pt-4 dark:border-border-dark">
                  {/* PR History */}
                  {pr.prHistory.length > 0 && (
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        PR History ({pr.prHistory.length} achievements)
                      </Text>
                      <View className="gap-2">
                        {pr.prHistory.slice(0, 5).map((entry, index) => (
                          <View
                            key={index}
                            className="flex-row items-center justify-between"
                          >
                            <View className="flex-row items-center gap-2">
                              <Ionicons
                                name={getPRTypeIcon(entry.type)}
                                size={14}
                                color={getPRTypeColor(entry.type)}
                              />
                              <Text className="text-sm text-zinc-900 dark:text-white capitalize">
                                {entry.type} PR:
                              </Text>
                            </View>
                            <View className="items-end">
                              <Text
                                className="text-sm font-semibold"
                                style={{ color: getPRTypeColor(entry.type) }}
                              >
                                {entry.type === "weight"
                                  ? `${entry.value} lbs × ${entry.reps} reps`
                                  : `${entry.value} reps × ${entry.weight} lbs`}
                              </Text>
                              <Text className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(entry.date)}
                              </Text>
                            </View>
                          </View>
                        ))}
                        {pr.prHistory.length > 5 && (
                          <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                            +{pr.prHistory.length - 5} more achievements
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Progress Charts */}
                  {loadingProgress.has(pr.exerciseId) ? (
                    <View className="items-center py-4">
                      <ActivityIndicator size="small" color="#ff4b8c" />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Loading progress...
                      </Text>
                    </View>
                  ) : exerciseProgressData.has(pr.exerciseId) ? (
                    (() => {
                      const progress = exerciseProgressData.get(pr.exerciseId)!;
                      const dataPoints = progress.dataPoints;
                      if (dataPoints.length === 0) {
                        return (
                          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No progress data available for this date range
                          </Text>
                        );
                      }

                      const volumes = dataPoints.map((dp) => dp.volume);
                      const weights = dataPoints.map((dp) => dp.maxWeight);
                      const avgVolume =
                        volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
                      const maxVolume = Math.max(...volumes);
                      const currentMaxWeight = Math.max(...weights);
                      const avgMaxWeight =
                        weights.reduce((sum, w) => sum + w, 0) / weights.length;

                      return (
                        <View className="gap-4">
                          {/* Volume Progression Summary */}
                          <View className="rounded-ds-control border border-border bg-surfaceAlt p-4 dark:border-border-dark dark:bg-surfaceAlt-dark">
                            <View className="flex-row items-center gap-2 mb-3">
                              <Ionicons name="trending-up" size={16} color="#10b981" />
                              <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                                Volume Progression
                              </Text>
                            </View>
                            <View className="gap-2">
                              <View className="flex-row justify-between items-center">
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                  Average Volume:
                                </Text>
                                <Text className="text-base font-bold text-[#ff4b8c] dark:text-[#ff6fa1]">
                                  {Math.round(avgVolume).toLocaleString()} lbs
                                </Text>
                              </View>
                              <View className="flex-row justify-between items-center">
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                  Highest Volume:
                                </Text>
                                <Text className="text-base font-bold text-success">
                                  {Math.round(maxVolume).toLocaleString()} lbs
                                </Text>
                              </View>
                              <View className="flex-row justify-between items-center">
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                  Total Sessions:
                                </Text>
                                <Text className="text-base font-bold text-[#ff4b8c] dark:text-[#ff6fa1]">
                                  {dataPoints.length}
                                </Text>
                              </View>
                              {progress.progression.volumePercentage !== 0 && (
                                <View className="mt-1 flex-row items-center justify-between border-t border-border pt-2 dark:border-border-dark">
                                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                                    Volume Change:
                                  </Text>
                                  <View className="flex-row items-center gap-1">
                                    <Ionicons
                                      name={
                                        progress.progression.trend === "up"
                                          ? "trending-up"
                                          : progress.progression.trend === "down"
                                            ? "trending-down"
                                            : "remove"
                                      }
                                      size={14}
                                      color={
                                        progress.progression.trend === "up"
                                          ? "#10b981"
                                          : progress.progression.trend === "down"
                                            ? "#ef4444"
                                            : "#9ca3af"
                                      }
                                    />
                                    <Text
                                      className="text-sm font-semibold"
                                      style={{
                                        color:
                                          progress.progression.trend === "up"
                                            ? "#10b981"
                                            : progress.progression.trend === "down"
                                              ? "#ef4444"
                                              : "#9ca3af",
                                      }}
                                    >
                                      {progress.progression.volumePercentage > 0
                                        ? "+"
                                        : ""}
                                      {progress.progression.volumePercentage.toFixed(
                                        0
                                      )}
                                      %
                                    </Text>
                                  </View>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Weight Progression Summary */}
                          <View className="rounded-ds-control border border-border bg-surfaceAlt p-4 dark:border-border-dark dark:bg-surfaceAlt-dark">
                            <View className="flex-row items-center gap-2 mb-3">
                              <Ionicons name="barbell" size={16} color="#ff4b8c" />
                              <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                                Max Weight Progression
                              </Text>
                            </View>
                            <View className="gap-2">
                              <View className="flex-row justify-between items-center">
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                  Current Max:
                                </Text>
                                <Text className="text-base font-bold text-[#ff4b8c] dark:text-[#ff6fa1]">
                                  {Math.round(currentMaxWeight)} lbs
                                </Text>
                              </View>
                              <View className="flex-row justify-between items-center">
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                  Average Max:
                                </Text>
                                <Text className="text-base font-bold text-[#ff4b8c] dark:text-[#ff6fa1]">
                                  {Math.round(avgMaxWeight)} lbs
                                </Text>
                              </View>
                              {progress.progression.weightPercentage !== 0 && (
                                <View className="mt-1 flex-row items-center justify-between border-t border-border pt-2 dark:border-border-dark">
                                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                                    Weight Change:
                                  </Text>
                                  <View className="flex-row items-center gap-1">
                                    <Ionicons
                                      name={
                                        progress.progression.weightPercentage > 0
                                          ? "trending-up"
                                          : progress.progression.weightPercentage < 0
                                            ? "trending-down"
                                            : "remove"
                                      }
                                      size={14}
                                      color={
                                        progress.progression.weightPercentage > 0
                                          ? "#10b981"
                                          : progress.progression.weightPercentage < 0
                                            ? "#ef4444"
                                            : "#9ca3af"
                                      }
                                    />
                                    <Text
                                      className="text-sm font-semibold"
                                      style={{
                                        color:
                                          progress.progression.weightPercentage > 0
                                            ? "#10b981"
                                            : progress.progression.weightPercentage < 0
                                              ? "#ef4444"
                                              : "#9ca3af",
                                      }}
                                    >
                                      {progress.progression.weightPercentage > 0
                                        ? "+"
                                        : ""}
                                      {progress.progression.weightPercentage.toFixed(
                                        0
                                      )}
                                      %
                                    </Text>
                                  </View>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })()
                  ) : null}
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="items-center justify-center py-12">
          <View className="items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark">
              <Ionicons name="trophy-outline" size={40} color={mutedIcon} />
            </View>
            <AppText variant="header" tone="default" className="mb-2 text-center">
              No PRs tracked yet
            </AppText>
            <AppText variant="body" tone="muted" className="mb-6 max-w-xs text-center normal-case">
              Select exercises to start tracking your personal records and see your progress over
              time.
            </AppText>
            <TouchableOpacity
              onPress={() => setIsSelectionModalOpen(true)}
              className="rounded-ds-control bg-primary px-6 py-3 dark:bg-primary-dark"
            >
              <AppText variant="body" tone="inverse" className="font-semibold normal-case">
                Select exercises
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </View>

      <ExerciseSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        selectedExercises={trackedExercises}
        onSave={handleSaveTrackedExercises}
      />
    </>
  );
}
