import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabaseClient";
import { Exercise, ExerciseOption } from "./exercise/types";
import ExerciseSearchBar from "./exercise/ExerciseSearchBar";
import ExerciseCategoryTabs from "./exercise/ExerciseCategoryTabs";
import ExerciseList from "./exercise/ExerciseList";
import AppText from "./ui/AppText";
import AppCard from "./ui/AppCard";
import AppButton from "./ui/AppButton";

type ExerciseSelectorProps = {
  onExerciseSelect: (exercises: Exercise[]) => void;
  onClose?: () => void;
  initialSelectedExercises?: Exercise[];
  existingExercises?: Exercise[];
  title?: string;
  confirmText?: string;
  showCloseButton?: boolean;
  workoutName?: string;
};

const ExerciseSelector = ({
  onExerciseSelect,
  onClose,
  initialSelectedExercises = [],
  existingExercises = [],
  title = "Select Exercises",
  confirmText = "Done",
  showCloseButton = false,
  workoutName = "",
}: ExerciseSelectorProps) => {
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(
    initialSelectedExercises,
  );
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchExercises = async (
    searchTerm: string,
    filter: string,
  ): Promise<void> => {
    setLoading(true);
    try {
      // First, get exercise IDs filtered by muscle group if filter is set
      let exerciseIds: number[] | null = null;

      if (filter) {
        const { getExercisesByMuscleGroups } = await import(
          "../lib/muscleGroupUtils"
        );

        if (filter === "Arms") {
          // Arms filter includes Biceps, Triceps, and Shoulders
          exerciseIds = await getExercisesByMuscleGroups([
            "Biceps",
            "Triceps",
            "Shoulders",
          ]);
        } else {
          // Single muscle group filter
          exerciseIds = await getExercisesByMuscleGroups([filter]);
        }
      }

      // Build query
      let query = supabase
        .from("exercise_library")
        .select("id, name")
        .order("name", { ascending: true });

      // Apply muscle group filter if set
      if (exerciseIds && exerciseIds.length > 0) {
        query = query.in("id", exerciseIds);
      } else if (exerciseIds && exerciseIds.length === 0) {
        // No exercises match the filter
        setExerciseOptions([]);
        setLoading(false);
        return;
      }

      // Apply search term
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query.range(0, 50);

      if (error) {
        console.error("Error fetching exercises:", error.message);
        return;
      }

      // Fetch muscle groups for the exercises
      if (data && data.length > 0) {
        const { getExercisesWithMuscleGroups } = await import(
          "../lib/muscleGroupUtils"
        );
        const exerciseIds = data.map((ex) => ex.id);
        const muscleGroupMap = await getExercisesWithMuscleGroups(exerciseIds);

        // Combine exercise data with muscle groups
        const exercisesWithMuscleGroups = data.map((exercise) => {
          const muscleGroups = muscleGroupMap.get(exercise.id) || [];
          const primaryMuscleGroup =
            muscleGroups.find((mg) => mg.is_primary)?.name ||
            muscleGroups[0]?.name;
          return {
            ...exercise,
            muscleGroups,
            primaryMuscleGroup,
          };
        });

        setExerciseOptions(exercisesWithMuscleGroups);
      } else {
        setExerciseOptions([]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchExercises(searchValue, selectedFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, selectedFilter]);

  // Filter exercises based on search input and exclude existing exercises
  const filteredExercises = exerciseOptions.filter((ex) => {
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const isExisting = existingExercises.some(
      (existing) => existing.id === ex.id,
    );
    return matchesSearch && !isExisting;
  });

  // Handle exercise selection
  const handleExerciseToggleInternal = (exercise: Exercise): void => {
    const isAlreadySelected = selectedExercises.some(
      (ex) => ex.id === exercise.id,
    );

    if (!isAlreadySelected) {
      setSelectedExercises((prev) => [...prev, exercise]);
    } else {
      setSelectedExercises((prev) =>
        prev.filter((ex) => ex.id !== exercise.id),
      );
    }
  };

  // Handle confirm selection
  const handleConfirm = () => {
    onExerciseSelect(selectedExercises);
  };

  const handleExerciseToggle = (exercise: Exercise) => {
    handleExerciseToggleInternal(exercise);
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View
        className="bg-chrome dark:bg-chrome-dark px-4 py-4"
        style={{ paddingTop: insets.top, paddingBottom: 8 }}
      >
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View>
            <AppText variant="subheader">
              {workoutName ? `Add Exercises to "${workoutName}"` : title}
            </AppText>
          </View>
        </View>
      </View>

      {/* Content */}
      <ExerciseSearchBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <ScrollView className="flex-1 p-4">
        <ExerciseCategoryTabs
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          selectedCount={selectedExercises.length}
          onClearAll={() => setSelectedExercises([])}
        />

        <ExerciseList
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          loading={loading}
          selectedFilter={selectedFilter}
          onToggleExercise={handleExerciseToggle}
        />
      </ScrollView>
      <View className="px-4 py-1 mb-4 mt-2">
        <AppCard className="flex-row justify-between" surface="alt">
          <View>
            <AppText variant="caption" tone="muted">
              Selection
            </AppText>
            <AppText className="font-bold text-sm">
              {selectedExercises.length}{" "}
              {selectedExercises.length === 1 ? "exercise" : "exercises"}{" "}
              selected
            </AppText>
          </View>
          <TouchableOpacity
            className="bg-primary dark:bg-primary-dark rounded-full flex items-center justify-center px-8"
            onPress={handleConfirm}
          >
            <AppText variant="caption">FINISH</AppText>
          </TouchableOpacity>
        </AppCard>
      </View>
    </View>
  );
};

export default ExerciseSelector;
