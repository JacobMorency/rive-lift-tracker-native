import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabaseClient";
import { Exercise, ExerciseOption } from "./exercise/types";
import ExerciseSearchBar from "./exercise/ExerciseSearchBar";
import ExerciseCategoryTabs from "./exercise/ExerciseCategoryTabs";
import ExerciseList from "./exercise/ExerciseList";

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
    initialSelectedExercises
  );
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchExercises = async (
    searchTerm: string,
    filter: string
  ): Promise<void> => {
    setLoading(true);
    try {
      let query = supabase
        .from("exercise_library")
        .select("*")
        .order("name", { ascending: true });

      if (filter === "Arms") {
        query = query.in("category", ["Biceps", "Triceps", "Shoulders"]);
      } else if (filter) {
        query = query.eq("category", filter);
      }

      const { data, error } = await query
        .ilike("name", `%${searchTerm}%`)
        .range(0, 50);

      if (error) {
        console.error("Error fetching exercises:", error.message);
        return;
      }

      setExerciseOptions(data || []);
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
      (existing) => existing.id === ex.id
    );
    return matchesSearch && !isExisting;
  });

  // Handle exercise selection
  const handleExerciseToggleInternal = (exercise: Exercise): void => {
    const isAlreadySelected = selectedExercises.some(
      (ex) => ex.id === exercise.id
    );

    if (!isAlreadySelected) {
      setSelectedExercises((prev) => [...prev, exercise]);
    } else {
      setSelectedExercises((prev) =>
        prev.filter((ex) => ex.id !== exercise.id)
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
    <View className="flex-1 bg-base-100">
      {/* Enhanced Header */}
      <View
        className="bg-base-200 px-4 py-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-base-300"
          >
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-base-content">
              {workoutName ? `Add Exercises to "${workoutName}"` : title}
            </Text>
            {selectedExercises.length > 0 && (
              <Text className="text-sm text-muted mt-1">
                {selectedExercises.length} exercise
                {selectedExercises.length !== 1 ? "s" : ""} selected
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            className="w-10 h-10 items-center justify-center rounded-full bg-primary"
            style={{
              shadowColor: "#ff4b8c",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="checkmark" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: "100%" }}
            />
          </View>
          <Text className="text-xs text-muted ml-2">Step 2 of 2</Text>
        </View>
      </View>

      {/* Content */}
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

      <ExerciseSearchBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
    </View>
  );
};

export default ExerciseSelector;
