import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/authcontext";
import {
  DateRange,
  getTrackedExercises,
  saveTrackedExercises,
  getTrackedPRData,
  TrackedPR,
} from "../../lib/statsUtils";
import ExerciseSelectionModal from "./exerciseselectionmodal";

type PRsTabProps = {
  dateRange: DateRange;
};

export default function PRsTab({ dateRange }: PRsTabProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [trackedExercises, setTrackedExercises] = useState<number[]>([]);
  const [trackedPRs, setTrackedPRs] = useState<TrackedPR[]>([]);
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

  const getCategoryColor = (category: string) => {
    return "#ff4b8c"; // All badges use primary color
  };

  return (
    <ScrollView
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Header Section */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-lg font-semibold text-base-content">
              Personal Records
            </Text>
            <Text className="text-sm text-muted">
              Track your best performances
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsSelectionModalOpen(true)}
            className="bg-primary rounded-lg px-4 py-2"
          >
            <Text className="text-primary-content font-medium">Manage</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-base-300 rounded-lg p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="list" size={16} color="#ff4b8c" />
              <Text className="text-sm font-medium text-muted">
                Currently Tracking
              </Text>
            </View>
            <Text className="text-sm text-muted">
              {trackedExercises.length}/3 limit
            </Text>
          </View>
          <Text className="text-2xl font-bold text-base-content">
            {trackedExercises.length} exercise
            {trackedExercises.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Tracked PRs List */}
      {loading ? (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <Text className="text-muted mt-2">Loading PRs...</Text>
        </View>
      ) : trackedPRs.length > 0 ? (
        <View className="gap-4">
          {trackedPRs.map((pr) => (
            <View key={pr.exerciseId} className="bg-base-300 rounded-xl p-6">
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
                    <Text className="text-lg font-semibold text-base-content">
                      {pr.exerciseName}
                    </Text>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: getCategoryColor(pr.category) + "20",
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: getCategoryColor(pr.category) }}
                      >
                        {pr.category}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name={
                    expandedExercise === pr.exerciseId
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {/* PR Stats */}
              <View className="gap-3">
                {pr.maxWeight > 0 ? (
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="barbell" size={16} color="#ff4b8c" />
                      <Text className="text-base-content">Max Weight:</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-primary">
                        {pr.maxWeight} lbs × {pr.maxWeightReps} reps
                      </Text>
                      {pr.maxWeightDate && (
                        <Text className="text-xs text-muted">
                          {formatDate(pr.maxWeightDate)}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : pr.maxReps > 0 ? (
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="repeat" size={16} color="#ff4b8c" />
                      <Text className="text-base-content">Max Reps:</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-primary">
                        {pr.maxReps} reps × {pr.maxRepsWeight} lbs
                      </Text>
                      {pr.maxRepsDate && (
                        <Text className="text-xs text-muted">
                          {formatDate(pr.maxRepsDate)}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : null}
              </View>

              {/* PR History (Expandable) */}
              {expandedExercise === pr.exerciseId &&
                pr.prHistory.length > 0 && (
                  <View className="mt-4 pt-4 border-t border-base-200">
                    <Text className="text-sm font-medium text-muted mb-3">
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
                            <Text className="text-sm text-base-content capitalize">
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
                            <Text className="text-xs text-muted">
                              {formatDate(entry.date)}
                            </Text>
                          </View>
                        </View>
                      ))}
                      {pr.prHistory.length > 5 && (
                        <Text className="text-xs text-muted text-center mt-2">
                          +{pr.prHistory.length - 5} more achievements
                        </Text>
                      )}
                    </View>
                  </View>
                )}
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-12">
          <View className="items-center">
            <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
              <Ionicons name="trophy-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-base-content mb-2">
              No PRs Tracked Yet
            </Text>
            <Text className="text-center text-muted mb-6 max-w-xs">
              Select up to 3 exercises to start tracking your personal records
              and see your progress over time.
            </Text>
            <TouchableOpacity
              onPress={() => setIsSelectionModalOpen(true)}
              className="bg-primary rounded-lg px-6 py-3"
            >
              <Text className="text-primary-content font-semibold">
                Select Exercises
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Exercise Selection Modal */}
      <ExerciseSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        selectedExercises={trackedExercises}
        onSave={handleSaveTrackedExercises}
      />
    </ScrollView>
  );
}
