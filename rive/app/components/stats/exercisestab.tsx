import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/authcontext";
import {
  DateRange,
  getExerciseProgressData,
  getMostUsedExercises,
} from "../../lib/statsUtils";
import ExerciseSelector from "./exercises/ExerciseSelector";
import ExerciseStats from "./exercises/ExerciseStats";
import ExerciseCharts from "./exercises/ExerciseCharts";
import ExerciseProgressDetails from "./exercises/ExerciseProgressDetails";

type ExercisesTabProps = {
  dateRange: DateRange;
};

export default function ExercisesTab({ dateRange }: ExercisesTabProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [exerciseData, setExerciseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<
    {
      id: number;
      name: string;
      category: string;
      usageCount: number;
      progressionTrend: "up" | "down" | "stable";
      progressionPercentage: number;
    }[]
  >([]);
  const [exercisesLoading, setExercisesLoading] = useState(true);

  const fetchMostUsedExercises = useCallback(async () => {
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
  }, [user?.id, dateRange, selectedExercise]);

  const fetchExerciseData = useCallback(async () => {
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
  }, [selectedExercise, user?.id, dateRange]);

  useEffect(() => {
    if (user?.id) {
      fetchMostUsedExercises();
    }
  }, [user?.id, dateRange, fetchMostUsedExercises]);

  useEffect(() => {
    if (selectedExercise && user?.id) {
      fetchExerciseData();
    }
  }, [selectedExercise, dateRange, user?.id, fetchExerciseData]);

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

  return (
    <ScrollView
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <ExerciseSelector
        exercises={availableExercises}
        selectedExerciseId={selectedExercise}
        onSelectExercise={setSelectedExercise}
        loading={exercisesLoading}
      />

      {selectedExercise && (
        <>
          <ExerciseStats exerciseData={exerciseData} loading={loading} />

          <ExerciseCharts
            exerciseData={exerciseData}
            volumeChartData={volumeChartData}
            weightChartData={weightChartData}
          />

          <ExerciseProgressDetails exerciseData={exerciseData} />
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
