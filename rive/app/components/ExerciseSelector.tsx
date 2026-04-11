import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabaseClient";
import { Exercise, ExerciseOption } from "./exercise/types";
import ExerciseSearchBar from "./exercise/ExerciseSearchBar";
import ExerciseCategoryTabs from "./exercise/ExerciseCategoryTabs";
import ExerciseList from "./exercise/ExerciseList";
import AppText from "./ui/AppText";
import AppCard from "./ui/AppCard";
import { useChromeIconTint } from "./ui/chromeTheme";
import { STICKY_BOTTOM_PRIMARY_SCROLL_PADDING } from "./ui/StickyBottomPrimaryButton";

/**
 * Scroll padding so the list clears the floating selection bar.
 * Includes extra room vs StickyBottomPrimaryButton plus space for the larger top gap above the card.
 */
const EXERCISE_SELECTOR_FLOAT_SCROLL_PADDING =
  STICKY_BOTTOM_PRIMARY_SCROLL_PADDING + 52;

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const chromeIconTint = useChromeIconTint();
  const primaryGlow = isDark ? "#ff6fa1" : "#ff4b8c";

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
            <Ionicons name="close" size={24} color={chromeIconTint} />
          </TouchableOpacity>

          <View>
            <AppText variant="subheader">
              {workoutName ? `Add Exercises to "${workoutName}"` : title}
            </AppText>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        <ExerciseSearchBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <ScrollView
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom:
              EXERCISE_SELECTOR_FLOAT_SCROLL_PADDING + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

        <View
          pointerEvents="box-none"
          className="absolute bottom-0 left-0 right-0 bg-transparent px-4 pt-8"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
          <AppCard
            className="flex-row items-center justify-between gap-3 !p-5"
            surface="alt"
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.35 : 0.12,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <View className="min-w-0 flex-1">
              <AppText variant="caption" tone="muted">
                Selection
              </AppText>
              <AppText
                variant="body"
                tone="default"
                className="font-bold normal-case"
              >
                {selectedExercises.length}{" "}
                {selectedExercises.length === 1 ? "exercise" : "exercises"}{" "}
                selected
              </AppText>
            </View>
            <TouchableOpacity
              className="shrink-0 min-h-[48px] px-7 rounded-2xl flex-row items-center justify-center bg-primary dark:bg-primary-dark active:opacity-90"
              onPress={handleConfirm}
              style={{
                shadowColor: primaryGlow,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.45,
                shadowRadius: 20,
                elevation: 14,
              }}
              accessibilityLabel={confirmText}
              accessibilityRole="button"
            >
              <AppText
                variant="body"
                tone="inverse"
                className="font-bold uppercase tracking-wider text-sm"
              >
                {confirmText}
              </AppText>
            </TouchableOpacity>
          </AppCard>
        </View>
      </View>
    </View>
  );
};

export default ExerciseSelector;
