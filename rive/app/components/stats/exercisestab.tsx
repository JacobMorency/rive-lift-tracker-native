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
  getExerciseProgressData,
  getMostUsedExercises,
  ExerciseProgressData,
} from "../../lib/statsUtils";

type ExercisesTabProps = {
  dateRange: DateRange;
};

export default function ExercisesTab({ dateRange }: ExercisesTabProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseProgressData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<
    Array<{ id: number; name: string; category: string; usageCount: number }>
  >([]);
  const [exercisesLoading, setExercisesLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMostUsedExercises();
    }
  }, [user?.id, dateRange]);

  useEffect(() => {
    if (selectedExercise && user?.id) {
      fetchExerciseData();
    }
  }, [selectedExercise, dateRange, user?.id]);

  const fetchMostUsedExercises = async () => {
    if (!user?.id) return;

    try {
      setExercisesLoading(true);
      const exercises = await getMostUsedExercises(user.id, dateRange);
      setAvailableExercises(exercises);

      // Auto-select the first exercise if none is selected
      if (exercises.length > 0 && !selectedExercise) {
        setSelectedExercise(exercises[0].id);
      }
    } catch (error) {
      console.error("Error fetching most used exercises:", error);
    } finally {
      setExercisesLoading(false);
    }
  };

  const fetchExerciseData = async () => {
    if (!selectedExercise || !user?.id) return;

    try {
      setLoading(true);
      const data = await getExerciseProgressData(
        user.id,
        selectedExercise,
        dateRange
      );
      setExerciseData(data);
    } catch (error) {
      console.error("Error fetching exercise data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create chart data
  const volumeChartData =
    exerciseData?.dataPoints.map((point, index) => ({
      value: point.volume,
      label: `${index + 1}`,
      dataPointText: point.volume.toLocaleString(),
    })) || [];

  const weightChartData =
    exerciseData?.dataPoints.map((point, index) => ({
      value: point.maxWeight,
      label: `${index + 1}`,
      dataPointText: `${point.maxWeight} lbs`,
    })) || [];

  const exerciseComparisonData = availableExercises.map((exercise) => ({
    value:
      exercise.id === selectedExercise
        ? exerciseData?.currentPR || 0
        : Math.random() * 200 + 50,
    label: exercise.name.split(" ")[0],
    frontColor: exercise.id === selectedExercise ? "#ff4b8c" : "#6b7280",
  }));

  return (
    <ScrollView
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Exercise Selector */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-base-content mb-3">
          Your Most Used Exercises
        </Text>
        {exercisesLoading ? (
          <View className="flex-row justify-center py-4">
            <ActivityIndicator size="small" color="#ff4b8c" />
            <Text className="text-muted ml-2">Loading exercises...</Text>
          </View>
        ) : availableExercises.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {availableExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => setSelectedExercise(exercise.id)}
                  className={`px-4 py-3 rounded-lg ${
                    selectedExercise === exercise.id
                      ? "bg-primary"
                      : "bg-base-300"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedExercise === exercise.id
                        ? "text-primary-content"
                        : "text-base-content"
                    }`}
                  >
                    {exercise.name}
                  </Text>
                  <Text
                    className={`text-xs ${
                      selectedExercise === exercise.id
                        ? "text-primary-content/70"
                        : "text-muted"
                    }`}
                  >
                    {exercise.usageCount} uses
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View className="bg-base-300 rounded-lg p-6 items-center">
            <Ionicons name="barbell-outline" size={48} color="#9ca3af" />
            <Text className="text-lg font-semibold text-base-content mt-3 mb-2">
              No Exercises Yet
            </Text>
            <Text className="text-muted text-center">
              Start tracking your workouts to see your most used exercises here
            </Text>
          </View>
        )}
      </View>

      {selectedExercise && (
        <>
          {/* Exercise Stats Cards */}
          <View className="gap-4 mb-6">
            <View className="flex-row gap-4">
              <View className="flex-1 bg-base-300 rounded-lg p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="trophy" size={16} color="#ff4b8c" />
                  <Text className="text-sm font-medium text-muted">
                    Current PR
                  </Text>
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color="#ff4b8c" />
                ) : (
                  <Text className="text-2xl font-bold text-base-content">
                    {exerciseData?.currentPR || 0} lbs
                  </Text>
                )}
              </View>
              <View className="flex-1 bg-base-300 rounded-lg p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="trending-up" size={16} color="#10b981" />
                  <Text className="text-sm font-medium text-muted">
                    Sessions
                  </Text>
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text className="text-2xl font-bold text-base-content">
                    {exerciseData?.dataPoints.length || 0}
                  </Text>
                )}
              </View>
            </View>

            {/* Progression Card */}
            {exerciseData?.progression &&
              exerciseData.dataPoints.length >= 2 && (
                <View className="bg-base-300 rounded-lg p-4">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Ionicons
                      name={
                        exerciseData.progression.trend === "up"
                          ? "trending-up"
                          : exerciseData.progression.trend === "down"
                            ? "trending-down"
                            : "remove"
                      }
                      size={16}
                      color={
                        exerciseData.progression.trend === "up"
                          ? "#10b981"
                          : exerciseData.progression.trend === "down"
                            ? "#ef4444"
                            : "#6b7280"
                      }
                    />
                    <Text className="text-sm font-medium text-muted">
                      Progression Trend
                    </Text>
                  </View>
                  <View className="gap-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-base-content">Volume Change:</Text>
                      <View className="flex-row items-center gap-1">
                        <Text
                          className={`text-sm font-semibold ${
                            exerciseData.progression.volumePercentage > 0
                              ? "text-success"
                              : exerciseData.progression.volumePercentage < 0
                                ? "text-error"
                                : "text-muted"
                          }`}
                        >
                          {exerciseData.progression.volumePercentage > 0
                            ? "+"
                            : ""}
                          {exerciseData.progression.volumePercentage.toFixed(1)}
                          %
                        </Text>
                        <Ionicons
                          name={
                            exerciseData.progression.volumePercentage > 0
                              ? "arrow-up"
                              : exerciseData.progression.volumePercentage < 0
                                ? "arrow-down"
                                : "remove"
                          }
                          size={12}
                          color={
                            exerciseData.progression.volumePercentage > 0
                              ? "#10b981"
                              : exerciseData.progression.volumePercentage < 0
                                ? "#ef4444"
                                : "#6b7280"
                          }
                        />
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-base-content">Weight Change:</Text>
                      <View className="flex-row items-center gap-1">
                        <Text
                          className={`text-sm font-semibold ${
                            exerciseData.progression.weightPercentage > 0
                              ? "text-success"
                              : exerciseData.progression.weightPercentage < 0
                                ? "text-error"
                                : "text-muted"
                          }`}
                        >
                          {exerciseData.progression.weightPercentage > 0
                            ? "+"
                            : ""}
                          {exerciseData.progression.weightPercentage.toFixed(1)}
                          %
                        </Text>
                        <Ionicons
                          name={
                            exerciseData.progression.weightPercentage > 0
                              ? "arrow-up"
                              : exerciseData.progression.weightPercentage < 0
                                ? "arrow-down"
                                : "remove"
                          }
                          size={12}
                          color={
                            exerciseData.progression.weightPercentage > 0
                              ? "#10b981"
                              : exerciseData.progression.weightPercentage < 0
                                ? "#ef4444"
                                : "#6b7280"
                          }
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
          </View>

          {/* Volume Progression Summary */}
          {volumeChartData.length > 0 && (
            <View className="mb-6 bg-base-300 rounded-xl p-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="trending-up" size={20} color="#10b981" />
                <Text className="text-lg font-semibold text-base-content ml-2">
                  {exerciseData?.exerciseName} - Volume Progression
                </Text>
              </View>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base-content">Average Volume:</Text>
                  <Text className="text-lg font-bold text-primary">
                    {Math.round(
                      volumeChartData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      ) / volumeChartData.length
                    ).toLocaleString()}{" "}
                    lbs
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base-content">Highest Volume:</Text>
                  <Text className="text-lg font-bold text-success">
                    {Math.max(
                      ...volumeChartData.map((item) => item.value)
                    ).toLocaleString()}{" "}
                    lbs
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base-content">Total Sessions:</Text>
                  <Text className="text-lg font-bold text-primary">
                    {volumeChartData.length}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Max Weight Progression Summary */}
          {weightChartData.length > 0 && (
            <View className="mb-6 bg-base-300 rounded-xl p-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="barbell" size={20} color="#ff4b8c" />
                <Text className="text-lg font-semibold text-base-content ml-2">
                  {exerciseData?.exerciseName} - Max Weight Progression
                </Text>
              </View>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base-content">Current Max:</Text>
                  <Text className="text-lg font-bold text-primary">
                    {Math.max(...weightChartData.map((item) => item.value))} lbs
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base-content">Average Max:</Text>
                  <Text className="text-lg font-bold text-primary">
                    {Math.round(
                      weightChartData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      ) / weightChartData.length
                    )}{" "}
                    lbs
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base-content">Progress Sessions:</Text>
                  <Text className="text-lg font-bold text-primary">
                    {weightChartData.length}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Exercise Comparison Summary */}
          <View className="mb-6 bg-base-300 rounded-xl p-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="bar-chart" size={20} color="#3b82f6" />
              <Text className="text-lg font-semibold text-base-content ml-2">
                Exercise Comparison (Max Weight)
              </Text>
            </View>

            <View className="gap-3">
              {availableExercises.map((exercise) => (
                <View
                  key={exercise.id}
                  className="flex-row justify-between items-center"
                >
                  <Text className="text-base-content">{exercise.name}:</Text>
                  <Text className="text-lg font-bold text-primary">
                    {exercise.id === selectedExercise
                      ? exerciseData?.currentPR || 0
                      : Math.round(Math.random() * 200 + 50)}{" "}
                    lbs
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* PR History */}
          {exerciseData?.prHistory && exerciseData.prHistory.length > 0 && (
            <View className="bg-base-300 rounded-xl p-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="trophy" size={20} color="#ff4b8c" />
                <Text className="text-lg font-semibold text-base-content ml-2">
                  PR History
                </Text>
              </View>

              <View className="gap-3">
                {exerciseData.prHistory.slice(-5).map((pr, index) => (
                  <View key={index} className="bg-base-200 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-base font-semibold text-base-content">
                          {pr.weight} lbs
                        </Text>
                        <Text className="text-sm text-muted">
                          {new Date(pr.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="bg-primary/10 px-2 py-1 rounded">
                        <Text className="text-primary text-sm font-bold">
                          PR #{exerciseData.prHistory.length - index}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {!selectedExercise && (
        <View className="flex-1 items-center justify-center py-20">
          <Ionicons name="barbell-outline" size={64} color="#6b7280" />
          <Text className="text-lg font-semibold text-base-content mt-4">
            Select an Exercise
          </Text>
          <Text className="text-muted text-center mt-2">
            Choose an exercise above to view detailed analytics and progression
            charts
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
