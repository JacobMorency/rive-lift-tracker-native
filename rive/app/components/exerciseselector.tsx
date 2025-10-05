import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
  workoutName?: string;
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
        {/* Enhanced Filters */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-base-content">
              Filter by Category
            </Text>
            {selectedExercises.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedExercises([])}
                className="flex-row items-center gap-1"
              >
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text className="text-sm text-error">Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`px-4 py-3 rounded-xl flex-row items-center gap-2 ${
                  selectedFilter === "" ? "bg-primary" : "bg-base-300"
                }`}
                onPress={() => setSelectedFilter("")}
                style={{
                  shadowColor:
                    selectedFilter === "" ? "#ff4b8c" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons
                  name="grid"
                  size={16}
                  color={selectedFilter === "" ? "#ffffff" : "#6b7280"}
                />
                <Text
                  className={`text-sm font-medium ${
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
                  className={`px-4 py-3 rounded-xl ${
                    selectedFilter === filter ? "bg-primary" : "bg-base-300"
                  }`}
                  onPress={() => setSelectedFilter(filter)}
                  style={{
                    shadowColor:
                      selectedFilter === filter ? "#ff4b8c" : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${
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

        {/* Enhanced Exercise List */}
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-base-content">
              {selectedFilter || "All"} Exercises
            </Text>
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-sm font-medium text-primary">
                {filteredExercises.length} available
              </Text>
            </View>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#ff4b8c" />
              <Text className="text-muted mt-3 text-center">
                Loading exercises...
              </Text>
            </View>
          ) : filteredExercises.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
                <Ionicons name="search" size={32} color="#9ca3af" />
              </View>
              <Text className="text-lg font-semibold text-base-content mb-2">
                No exercises found
              </Text>
              <Text className="text-muted text-center">
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.some(
                  (ex) => ex.id === exercise.id
                );

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    className={`rounded-xl p-4 ${
                      isSelected
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-base-200 border-2 border-transparent"
                    }`}
                    onPress={() => handleExerciseToggle(exercise)}
                    style={{
                      shadowColor: isSelected ? "#ff4b8c" : "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.15 : 0.05,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View className="flex-row items-center gap-4">
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          isSelected ? "bg-primary" : "bg-base-300"
                        }`}
                      >
                        <Ionicons
                          name={isSelected ? "checkmark" : "add"}
                          size={20}
                          color={isSelected ? "#ffffff" : "#6b7280"}
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className={`text-lg font-semibold ${
                            isSelected ? "text-primary" : "text-base-content"
                          }`}
                        >
                          {formatExerciseName(exercise.name)}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <View className="bg-base-300 px-2 py-1 rounded-full">
                            <Text className="text-xs text-muted">
                              {exercise.category}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Enhanced Floating Search Bar */}
      <View
        className="px-6 pt-4 bg-base-100"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View
          className="flex-row items-center bg-base-200 rounded-full px-4 py-3 border-2 border-base-300"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-base-content bg-transparent text-base"
            placeholder="Search exercises..."
            placeholderTextColor="#9ca3af"
            value={searchValue}
            onChangeText={setSearchValue}
            returnKeyType="search"
          />
          {searchValue.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchValue("")}
              className="ml-2"
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default ExerciseSelector;
