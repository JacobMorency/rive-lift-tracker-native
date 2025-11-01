import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet as StatsExerciseSet } from "../../lib/statsUtils";
import { ExerciseSet } from "./types";

type ProgressComparisonPanelProps = {
  lastSessionSets: StatsExerciseSet[];
  currentSet: ExerciseSet;
  sets: ExerciseSet[];
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
};

export default function ProgressComparisonPanel({
  lastSessionSets,
  currentSet,
  sets,
  isExpanded,
  setIsExpanded,
}: ProgressComparisonPanelProps) {
  if (lastSessionSets.length === 0) return null;

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
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center"
        >
          <Ionicons name="trending-up" size={16} color="#10b981" />
          <View className="ml-2">
            <Text className="text-sm font-semibold text-base-content">
              Compare to Last Session
            </Text>
            {lastSessionSets.length > 0 && lastSessionSets[0].created_at && (
              <Text className="text-xs text-muted">
                {new Date(lastSessionSets[0].created_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="p-1"
        >
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#6b7280"
          />
        </TouchableOpacity>
      </View>

      {isExpanded ? (
        <View className="gap-3">
          {(() => {
            const targetIndex = (currentSet.set_number || 1) - 1;
            const lastSet = lastSessionSets[targetIndex];
            if (!lastSet) return null;
            const currentWeight = currentSet?.weight || 0;
            const currentReps = currentSet?.is_unilateral
              ? (currentSet.left_reps || 0) + (currentSet.right_reps || 0)
              : currentSet?.reps || 0;

            const lastWeight = lastSet.weight || 0;
            const lastReps = lastSet.is_unilateral
              ? (lastSet.left_reps || 0) + (lastSet.right_reps || 0)
              : lastSet.reps || 0;

            const hasCurrentData = currentWeight > 0 || currentReps > 0;
            const weightProgress = hasCurrentData
              ? currentWeight > lastWeight
                ? "up"
                : currentWeight < lastWeight
                  ? "down"
                  : "same"
              : "neutral";
            const repsProgress = hasCurrentData
              ? currentReps > lastReps
                ? "up"
                : currentReps < lastReps
                  ? "down"
                  : "same"
              : "neutral";

            const weightPercentage =
              lastWeight > 0
                ? Math.round(((currentWeight - lastWeight) / lastWeight) * 100)
                : 0;
            const repsPercentage =
              lastReps > 0
                ? Math.round(((currentReps - lastReps) / lastReps) * 100)
                : 0;

            return (
              <View
                key={targetIndex}
                className="bg-base-200 rounded-lg p-2"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold text-base-content">
                    Set {targetIndex + 1}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    {weightProgress === "up" && (
                      <Ionicons
                        name="arrow-up"
                        size={12}
                        color="#10b981"
                      />
                    )}
                    {weightProgress === "down" && (
                      <Ionicons name="arrow-down" size={12} color="#ef4444" />
                    )}
                    {weightProgress === "same" && (
                      <Ionicons name="remove" size={12} color="#6b7280" />
                    )}
                    {weightProgress === "neutral" && (
                      <Ionicons
                        name="ellipse-outline"
                        size={12}
                        color="#9ca3af"
                      />
                    )}
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  {/* Last Session */}
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">
                      Last Session
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="bg-base-300 px-2 py-1 rounded">
                        <Text className="text-sm font-semibold text-base-content">
                          {lastWeight} lbs
                        </Text>
                      </View>
                      <View className="bg-base-300 px-2 py-1 rounded">
                        <Text className="text-sm font-semibold text-base-content">
                          {lastReps} reps
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Current Session */}
                  <View className="flex-1 items-end">
                    <Text className="text-xs text-muted mb-1">Current</Text>
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`px-2 py-1 rounded ${
                          weightProgress === "up"
                            ? "bg-success/20"
                            : weightProgress === "down"
                              ? "bg-error/20"
                              : weightProgress === "neutral"
                                ? "bg-base-300/50"
                                : "bg-base-300"
                        }`}
                      >
                        <View className="flex-row items-center gap-1">
                          <Text
                            className={`text-sm font-semibold ${
                              weightProgress === "up"
                                ? "text-success"
                                : weightProgress === "down"
                                  ? "text-error"
                                  : weightProgress === "neutral"
                                    ? "text-muted"
                                    : "text-base-content"
                            }`}
                          >
                            {currentWeight || "--"} lbs
                          </Text>
                          {hasCurrentData && weightPercentage !== 0 && (
                            <Text
                              className={`text-xs ${
                                weightProgress === "up"
                                  ? "text-success"
                                  : weightProgress === "down"
                                    ? "text-error"
                                    : "text-muted"
                              }`}
                            >
                              {weightPercentage > 0 ? "+" : ""}
                              {weightPercentage}%
                            </Text>
                          )}
                        </View>
                      </View>
                      <View
                        className={`px-2 py-1 rounded ${
                          repsProgress === "up"
                            ? "bg-success/20"
                            : repsProgress === "down"
                              ? "bg-error/20"
                              : repsProgress === "neutral"
                                ? "bg-base-300/50"
                                : "bg-base-300"
                        }`}
                      >
                        <View className="flex-row items-center gap-1">
                          <Text
                            className={`text-sm font-semibold ${
                              repsProgress === "up"
                                ? "text-success"
                                : repsProgress === "down"
                                  ? "text-error"
                                  : repsProgress === "neutral"
                                    ? "text-muted"
                                    : "text-base-content"
                            }`}
                          >
                            {currentReps || "--"} reps
                          </Text>
                          {hasCurrentData && repsPercentage !== 0 && (
                            <Text
                              className={`text-xs ${
                                repsProgress === "up"
                                  ? "text-success"
                                  : repsProgress === "down"
                                    ? "text-error"
                                    : "text-muted"
                              }`}
                            >
                              {repsPercentage > 0 ? "+" : ""}
                              {repsPercentage}%
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })()}

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
      ) : (
        <View className="py-1">
          <View className="items-center">
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#6b7280"
            />
            <Text className="text-xs text-muted text-center mt-1">
              Tap to expand
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

