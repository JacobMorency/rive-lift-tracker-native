import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabaseClient";

type Exercise = {
  id: number;
  name: string;
  category: string;
};

type ExerciseSelectorProps = {
  onExerciseSelect: (exercises: Exercise[]) => void;
  onClose?: () => void;
  initialSelectedExercises?: Exercise[];
  existingExercises?: Exercise[];
  title?: string;
  confirmText?: string;
  showCloseButton?: boolean;
};

type ExerciseOption = {
  id: number;
  name: string;
  category: string;
};

const ExerciseSelector = ({
  onExerciseSelect,
  onClose,
  initialSelectedExercises = [],
  existingExercises = [],
  title = "Select Exercises",
  confirmText = "Done",
  showCloseButton = false,
}: ExerciseSelectorProps) => {
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(
    initialSelectedExercises
  );
  const [loading, setLoading] = useState(false);

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
  const handleExerciseToggle = (exercise: Exercise): void => {
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

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <View className="flex-1 bg-base-100">
      {/* Header */}
      <View className="p-4 border-b border-base-300">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-base-content">
            {title}
          </Text>
          <View className="flex-row items-center space-x-2">
            {showCloseButton && onClose && (
              <TouchableOpacity
                className="px-3 py-1 bg-neutral rounded"
                onPress={onClose}
              >
                <Text className="text-neutral-content text-sm">Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="px-3 py-1 bg-primary rounded"
              onPress={handleConfirm}
            >
              <Text className="text-primary-content text-sm">
                {confirmText} ({selectedExercises.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-sm text-muted">
          {selectedExercises.length} exercise
          {selectedExercises.length !== 1 ? "s" : ""} selected
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
        {/* Search */}
        <View className="mb-4">
          <TextInput
            className="border border-base-200 rounded-lg px-3 py-2 text-base-content bg-base-200"
            placeholder="Search exercises..."
            placeholderTextColor="#9ca3af"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </View>

        {/* Filters */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className={`px-4 py-2 rounded-full ${
                  selectedFilter === "" ? "bg-primary" : "bg-base-300"
                }`}
                onPress={() => setSelectedFilter("")}
              >
                <Text
                  className={`text-sm ${
                    selectedFilter === ""
                      ? "text-primary-content"
                      : "text-base-content"
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>
              {["Chest", "Back", "Legs", "Arms"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  className={`px-4 py-2 rounded-full ${
                    selectedFilter === filter ? "bg-primary" : "bg-base-300"
                  }`}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    className={`text-sm ${
                      selectedFilter === filter
                        ? "text-primary-content"
                        : "text-base-content"
                    }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Exercise List */}
        <View>
          <Text className="text-sm font-semibold text-base-content mb-3">
            {selectedFilter || "All"} Exercises ({filteredExercises.length})
          </Text>

          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-muted mt-2">Loading exercises...</Text>
            </View>
          ) : filteredExercises.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-muted">No exercises found</Text>
            </View>
          ) : (
            <View>
              {filteredExercises.map((exercise, index) => {
                const isSelected = selectedExercises.some(
                  (ex) => ex.id === exercise.id
                );

                return (
                  <View key={exercise.id}>
                    <View className="flex-row items-center space-x-2">
                      <TouchableOpacity
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          isSelected ? "bg-success" : "bg-base-300"
                        }`}
                        onPress={() => handleExerciseToggle(exercise)}
                      >
                        <Text
                          className={`text-sm ${isSelected ? "text-success-content" : "text-base-content"}`}
                        >
                          {isSelected ? "✓" : "+"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-4 px-3 bg-base-300 rounded-lg"
                        onPress={() => handleExerciseToggle(exercise)}
                      >
                        <Text className="text-base-content">
                          {formatExerciseName(exercise.name)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {index < filteredExercises.length - 1 && (
                      <View className="mb-3" />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ExerciseSelector;
