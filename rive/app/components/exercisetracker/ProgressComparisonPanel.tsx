import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet as StatsExerciseSet } from "../../lib/statsUtils";
import { ExerciseSet } from "./types";
import SetComparison from "./SetComparison";

type ProgressComparisonPanelProps = {
  lastSessionSets: StatsExerciseSet[];
  currentSet: ExerciseSet;
  sets: ExerciseSet[];
};

export default function ProgressComparisonPanel({
  lastSessionSets,
  currentSet,
  sets,
}: ProgressComparisonPanelProps) {
  const [showAllSets, setShowAllSets] = useState<boolean>(false);
  
  const currentSetNumber = currentSet.set_number || 1;
  
  // Reset showAllSets when the current set number changes
  useEffect(() => {
    setShowAllSets(false);
  }, [currentSetNumber]);
  
  if (lastSessionSets.length === 0) return null;

  const startIndex = currentSetNumber - 1;
  const totalAvailableSets = lastSessionSets.length;

  // Calculate which sets to display
  // When showAllSets is true, show all sets from last session
  // When false, show only the current set
  const setsToDisplay = showAllSets
    ? lastSessionSets
    : lastSessionSets.slice(startIndex, startIndex + 1);

  const hasMoreSets = lastSessionSets.length > 1;
  const needsScrolling = showAllSets && lastSessionSets.length > 3;

  return (
    <View
      className="bg-base-300 rounded-xl p-4 mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="trending-up" size={16} color="#10b981" />
          <Text className="text-sm font-semibold text-base-content ml-2">
            Compare to Last Session
          </Text>
        </View>
        {lastSessionSets.length > 0 && lastSessionSets[0].created_at && (
          <Text className="text-xs text-muted">
            {new Date(lastSessionSets[0].created_at).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View className="gap-3">
          {needsScrolling ? (
            <ScrollView
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <View className="gap-3">
                {setsToDisplay.map((lastSet, index) => {
                  const setIndex = showAllSets ? index : startIndex + index;
                  const isCurrentSet = setIndex === startIndex;
                  const setToCompare = isCurrentSet
                    ? currentSet
                    : sets[setIndex] || null;

                  return (
                    <SetComparison
                      key={setIndex}
                      currentSet={setToCompare}
                      lastSet={lastSet}
                      setIndex={setIndex}
                      sets={sets}
                    />
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View className="gap-3">
              {setsToDisplay.map((lastSet, index) => {
                const setIndex = showAllSets ? index : startIndex + index;
                const isCurrentSet = setIndex === startIndex;
                const setToCompare = isCurrentSet
                  ? currentSet
                  : sets[setIndex] || null;

                return (
                  <SetComparison
                    key={setIndex}
                    currentSet={setToCompare}
                    lastSet={lastSet}
                    setIndex={setIndex}
                    sets={sets}
                  />
                );
              })}
            </View>
          )}

          {hasMoreSets && (
            <TouchableOpacity
              onPress={() => setShowAllSets(!showAllSets)}
              className="flex-row items-center justify-center gap-1 py-2 rounded-lg bg-base-200"
            >
              <Ionicons
                name={showAllSets ? "remove-circle-outline" : "add-circle-outline"}
                size={16}
                color="#ff4b8c"
              />
              <Text className="text-primary text-sm font-medium">
                {showAllSets ? "Hide Additional Sets" : "Show All Sets"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Progress Summary */}
          {sets.length > 0 && (
            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-muted">
                  Overall Progress
                </Text>
                <View className="flex-row items-center gap-2">
                  {(() => {
                    const totalLastVolume = lastSessionSets.reduce(
                      (total, set) => {
                        const reps = set.is_unilateral
                          ? (set.left_reps || 0) + (set.right_reps || 0)
                          : set.reps || 0;
                        return total + (set.weight || 0) * reps;
                      },
                      0
                    );

                    const totalCurrentVolume = sets.reduce((total, set) => {
                      const reps = set.is_unilateral
                        ? (set.left_reps || 0) + (set.right_reps || 0)
                        : set.reps || 0;
                      return total + (set.weight || 0) * reps;
                    }, 0);

                    const hasAnyCurrentData = sets.some(
                      (set) =>
                        (set.weight && set.weight > 0) ||
                        (set.reps && set.reps > 0) ||
                        (set.left_reps && set.left_reps > 0) ||
                        (set.right_reps && set.right_reps > 0)
                    );

                    const volumeProgress = hasAnyCurrentData
                      ? totalCurrentVolume > totalLastVolume
                        ? "up"
                        : totalCurrentVolume < totalLastVolume
                          ? "down"
                          : "same"
                      : "neutral";

                    return (
                      <>
                        <View className="flex-row items-center gap-1">
                          <Text className="text-xs text-muted">Volume:</Text>
                          <Text
                            className={`text-sm font-semibold ${
                              volumeProgress === "up"
                                ? "text-success"
                                : volumeProgress === "down"
                                  ? "text-error"
                                  : volumeProgress === "neutral"
                                    ? "text-muted"
                                    : "text-base-content"
                            }`}
                          >
                            {totalCurrentVolume.toLocaleString()} lbs
                          </Text>
                        </View>
                        {volumeProgress === "up" && (
                          <Ionicons
                            name="trending-up"
                            size={14}
                            color="#10b981"
                          />
                        )}
                        {volumeProgress === "down" && (
                          <Ionicons
                            name="trending-down"
                            size={14}
                            color="#ef4444"
                          />
                        )}
                        {volumeProgress === "neutral" && (
                          <Ionicons
                            name="ellipse-outline"
                            size={14}
                            color="#9ca3af"
                          />
                        )}
                      </>
                    );
                  })()}
                </View>
              </View>
            </View>
          )}
      </View>
    </View>
  );
}

