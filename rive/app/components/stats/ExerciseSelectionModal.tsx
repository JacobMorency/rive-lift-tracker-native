import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getMostUsedExercises } from "../../lib/statsUtils";
import { MuscleGroup } from "../../lib/muscleGroupUtils";
import ExerciseSearchBar from "../exercise/ExerciseSearchBar";
import AppText from "../ui/AppText";
import AppCard from "../ui/AppCard";
import StickyBottomPrimaryButton, {
  STICKY_BOTTOM_PRIMARY_SCROLL_PADDING,
} from "../ui/StickyBottomPrimaryButton";

type Exercise = {
  id: number;
  name: string;
  muscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: string;
  usageCount: number;
};

type ExerciseSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedExercises: number[];
  onSave: (exerciseIds: number[]) => void;
};

const formatExerciseName = (name: string) =>
  name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ExerciseSelectionModal({
  isOpen,
  onClose,
  selectedExercises,
  onSave,
}: ExerciseSelectionModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primaryGlow = isDark ? "#ff6fa1" : "#ff4b8c";
  const mutedIcon = isDark ? "#a1a1aa" : "#6b7280";

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempSelectedExercises, setTempSelectedExercises] = useState<number[]>(
    [],
  );

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchExercises();
      setTempSelectedExercises(selectedExercises);
    }
  }, [isOpen, user?.id, selectedExercises]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises(availableExercises);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = availableExercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(q) ||
          (exercise.primaryMuscleGroup?.toLowerCase().includes(q) ?? false),
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, availableExercises]);

  const fetchExercises = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const exercises = await getMostUsedExercises(user.id, { type: "all" });
      setAvailableExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseToggle = (exerciseId: number) => {
    setTempSelectedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };

  const handleSave = () => {
    onSave(tempSelectedExercises);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedExercises(selectedExercises);
    setSearchQuery("");
    onClose();
  };

  const scrollBottomPadding =
    STICKY_BOTTOM_PRIMARY_SCROLL_PADDING + Math.max(insets.bottom, 8);

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-background dark:bg-background-dark">
        <View
          className="border-b border-border bg-chrome px-4 dark:border-border-dark dark:bg-chrome-dark"
          style={{ paddingTop: insets.top, paddingBottom: 8 }}
        >
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleCancel}
              accessibilityLabel="Close"
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#f5f5f5" : "#111113"}
              />
            </TouchableOpacity>
            <AppText
              variant="subheader"
              tone="default"
              className="flex-1 font-bold tracking-tight"
              numberOfLines={1}
            >
              Track PRs
            </AppText>
          </View>
        </View>

        <ExerciseSearchBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          compact
        />

        <View className="px-4 pb-2 pt-1">
          <AppCard surface="alt" className="flex-row items-center justify-between py-3">
            <View>
              <AppText variant="caption" tone="muted" className="normal-case">
                Selection
              </AppText>
              <AppText variant="body" tone="default" className="font-semibold normal-case">
                {tempSelectedExercises.length}{" "}
                {tempSelectedExercises.length === 1 ? "exercise" : "exercises"}{" "}
                selected
              </AppText>
            </View>
          </AppCard>
        </View>

        <ScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: scrollBottomPadding,
          }}
        >
          {loading ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color={primaryGlow} />
              <AppText variant="body" tone="muted" className="mt-3 text-center normal-case">
                Loading exercises…
              </AppText>
            </View>
          ) : filteredExercises.length > 0 ? (
            <View className="gap-2 pb-2">
              {filteredExercises.map((exercise) => {
                const isSelected = tempSelectedExercises.includes(exercise.id);
                return (
                  <AppCard
                    key={exercise.id}
                    onPress={() => handleExerciseToggle(exercise.id)}
                    className={
                      isSelected ? "border border-primary dark:border-primary" : ""
                    }
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="min-w-0 flex-1">
                        {exercise.primaryMuscleGroup ? (
                          <View className="mb-1 flex-row flex-wrap items-center gap-2">
                            <View className="rounded-full bg-primary/15 px-2 py-0.5 dark:bg-primary-dark/20">
                              <AppText
                                variant="caption"
                                tone="primary"
                                className="font-semibold normal-case"
                              >
                                {exercise.primaryMuscleGroup}
                              </AppText>
                            </View>
                          </View>
                        ) : null}
                        <AppText variant="body" tone="default" className="font-bold">
                          {formatExerciseName(exercise.name)}
                        </AppText>
                        <AppText variant="caption" tone="muted" className="mt-1 normal-case">
                          Used {exercise.usageCount}{" "}
                          {exercise.usageCount === 1 ? "time" : "times"}
                        </AppText>
                      </View>
                      <View className="shrink-0 p-1">
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                          size={24}
                          color={isSelected ? primaryGlow : mutedIcon}
                        />
                      </View>
                    </View>
                  </AppCard>
                );
              })}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surface dark:bg-surface-dark">
                <Ionicons name="barbell-outline" size={32} color={mutedIcon} />
              </View>
              <AppText variant="subheader" tone="default" className="mb-2 text-center">
                No exercises found
              </AppText>
              <AppText variant="body" tone="muted" className="max-w-xs text-center normal-case">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start tracking workouts to see exercises here"}
              </AppText>
            </View>
          )}
        </ScrollView>

        <StickyBottomPrimaryButton
          label="Save selection"
          onPress={handleSave}
          disabled={loading}
          accessibilityLabel="Save PR exercise selection"
          accessibilityHint="Saves the exercises you chose to track for personal records"
        />
      </View>
    </Modal>
  );
}
