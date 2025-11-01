import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import RepsInput from "./RepsInput";
import WeightInput from "./WeightInput";
import WeightIncrementTabs from "./WeightIncrementTabs";

type SetInputFormProps = {
  currentSet: ExerciseSet;
  setCurrentSet: (set: ExerciseSet) => void;
  weightInput: string;
  setWeightInput: (value: string) => void;
  weightIncrement: number;
  setWeightIncrement: (value: number) => void;
  showPartials: boolean;
  setShowPartials: (value: boolean) => void;
  onAddSet: () => void;
  onCopyLastSet: () => void;
  hasSets: boolean;
};

export default function SetInputForm({
  currentSet,
  setCurrentSet,
  weightInput,
  setWeightInput,
  weightIncrement,
  setWeightIncrement,
  showPartials,
  setShowPartials,
  onAddSet,
  onCopyLastSet,
  hasSets,
}: SetInputFormProps) {
  return (
    <View
      className="bg-base-200 rounded-xl p-4 mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-base-content">
          Set {currentSet.set_number}
        </Text>
        <TouchableOpacity
          onPress={() => setShowPartials(!showPartials)}
          className={`px-2 py-1 rounded ${
            showPartials ? "bg-primary" : "bg-base-300"
          }`}
        >
          <Text
            className={`${
              showPartials ? "text-primary-content" : "text-base-content"
            } text-xs font-medium`}
          >
            {showPartials ? "Hide Partials" : "Show Partials"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        {/* Reps - Conditional based on unilateral */}
        {currentSet.is_unilateral ? (
          <View className="gap-3">
            <RepsInput
              isUnilateral={true}
              leftValue={currentSet.left_reps}
              rightValue={currentSet.right_reps}
              onLeftChange={(val) =>
                setCurrentSet({ ...currentSet, left_reps: val })
              }
              onRightChange={(val) =>
                setCurrentSet({ ...currentSet, right_reps: val })
              }
              variant="form"
            />

            {/* Weight (shown for unilateral as well) */}
            <WeightInput
              value={currentSet.weight}
              textInputValue={weightInput}
              onChange={(val) => setCurrentSet({ ...currentSet, weight: val })}
              onTextChange={setWeightInput}
              weightIncrement={weightIncrement}
              variant="form"
            />
          </View>
        ) : (
          /* Regular Reps & Weight Inline */
          <View className="flex-row gap-3">
            <RepsInput
              value={currentSet.reps}
              onChange={(val) => setCurrentSet({ ...currentSet, reps: val })}
              variant="form"
            />

            <WeightInput
              value={currentSet.weight}
              textInputValue={weightInput}
              onChange={(val) => setCurrentSet({ ...currentSet, weight: val })}
              onTextChange={setWeightInput}
              weightIncrement={weightIncrement}
              variant="form"
            />
          </View>
        )}

        {/* Partial Reps (toggleable) */}
        {showPartials && (
          <View className="flex-1">
            <View className="mb-1">
              <Text className="text-sm font-semibold text-base-content">
                Partials
              </Text>
            </View>
            <View
              className={`rounded-xl flex-row items-center ${
                currentSet.partialReps !== null &&
                currentSet.partialReps > 0
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-base-300 border-2 border-transparent"
              }`}
            >
              <TouchableOpacity
                className="px-3 py-2"
                onPress={() => {
                  const newValue = (currentSet.partialReps || 0) - 1;
                  if (newValue >= 0) {
                    setCurrentSet({ ...currentSet, partialReps: newValue });
                  }
                }}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={
                    currentSet.partialReps !== null &&
                    currentSet.partialReps > 0
                      ? "#ff4b8c"
                      : "#6b7280"
                  }
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 text-center py-2 text-lg font-bold text-base-content"
                value={
                  currentSet.partialReps !== null
                    ? currentSet.partialReps.toString()
                    : ""
                }
                onChangeText={(value) => {
                  if (value === "" || value === "-") {
                    setCurrentSet({ ...currentSet, partialReps: null });
                  } else {
                    const parsed = parseInt(value);
                    if (!isNaN(parsed)) {
                      setCurrentSet({ ...currentSet, partialReps: parsed });
                    }
                  }
                }}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <TouchableOpacity
                className="px-3 py-2"
                onPress={() =>
                  setCurrentSet({
                    ...currentSet,
                    partialReps: (currentSet.partialReps || 0) + 1,
                  })
                }
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={
                    currentSet.partialReps !== null &&
                    currentSet.partialReps > 0
                      ? "#ff4b8c"
                      : "#6b7280"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Weight Increment Tabs */}
      <WeightIncrementTabs
        value={weightIncrement}
        onChange={setWeightIncrement}
      />

      {/* Unilateral Toggle */}
      <View className="mt-6">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className={`w-6 h-6 rounded border-2 items-center justify-center ${
              currentSet.is_unilateral
                ? "bg-primary border-primary"
                : "border-base-content/30"
            }`}
            onPress={() =>
              setCurrentSet({
                ...currentSet,
                is_unilateral: !currentSet.is_unilateral,
              })
            }
          >
            {currentSet.is_unilateral && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
          <Text className="text-sm text-base-content">Unilateral (L/R)</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mt-6">
        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl flex-row items-center justify-center ${
            currentSet.is_unilateral
              ? currentSet.left_reps === null ||
                  currentSet.right_reps === null ||
                  currentSet.weight === null
                ? "bg-base-300"
                : "bg-primary"
              : currentSet.reps === null ||
                  currentSet.weight === null ||
                  currentSet.reps === 0
                ? "bg-base-300"
                : "bg-primary"
          }`}
          onPress={onAddSet}
          disabled={
            currentSet.is_unilateral
              ? currentSet.left_reps === null ||
                  currentSet.right_reps === null ||
                  currentSet.weight === null
              : currentSet.reps === null ||
                  currentSet.weight === null ||
                  currentSet.reps === 0
          }
          style={{
            shadowColor: currentSet.is_unilateral
              ? currentSet.left_reps !== null &&
                  currentSet.right_reps !== null &&
                  currentSet.weight !== null
                ? "#ff4b8c"
                : "#000"
              : currentSet.reps !== null &&
                  currentSet.weight !== null &&
                  currentSet.reps > 0
                ? "#ff4b8c"
                : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: currentSet.is_unilateral
              ? currentSet.left_reps !== null &&
                  currentSet.right_reps !== null &&
                  currentSet.weight !== null
                ? 0.3
                : 0.1
              : currentSet.reps !== null &&
                  currentSet.weight !== null &&
                  currentSet.reps > 0
                ? 0.3
                : 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons
            name="add-circle"
            size={20}
            color={
              currentSet.is_unilateral
                ? currentSet.left_reps === null ||
                    currentSet.right_reps === null ||
                    currentSet.weight === null
                  ? "#6b7280"
                  : "#ffffff"
                : currentSet.reps === null ||
                    currentSet.weight === null ||
                    currentSet.reps === 0
                  ? "#6b7280"
                  : "#ffffff"
            }
          />
          <Text
            className={`text-center font-bold ml-2 ${
              currentSet.is_unilateral
                ? currentSet.left_reps === null ||
                    currentSet.right_reps === null ||
                    currentSet.weight === null
                  ? "text-muted"
                  : "text-primary-content"
                : currentSet.reps === null ||
                    currentSet.weight === null ||
                    currentSet.reps === 0
                  ? "text-muted"
                  : "text-primary-content"
            }`}
          >
            Add Set
          </Text>
        </TouchableOpacity>
        {hasSets && (
          <TouchableOpacity
            className="px-6 py-4 border-2 border-primary rounded-xl flex-row items-center bg-primary/5"
            onPress={onCopyLastSet}
            style={{
              shadowColor: "#ff4b8c",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="copy-outline" size={20} color="#ff4b8c" />
            <Text className="text-primary text-center ml-2 font-semibold">
              Copy Last
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

