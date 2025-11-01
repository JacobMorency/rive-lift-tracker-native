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
  // Check if set is complete (allow weight to be 0 for bodyweight exercises)
  const isSetComplete = currentSet.is_unilateral
    ? currentSet.left_reps !== null &&
      currentSet.right_reps !== null &&
      currentSet.weight !== null &&
      currentSet.weight >= 0
    : currentSet.reps !== null &&
      currentSet.reps !== 0 &&
      currentSet.weight !== null &&
      currentSet.weight >= 0;

  // Quick rep presets
  const quickReps = [5, 8, 10, 12, 15];

  const handleQuickRep = (reps: number) => {
    if (!currentSet.is_unilateral) {
      setCurrentSet({ ...currentSet, reps });
    }
  };
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
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => setShowPartials(!showPartials)}
            className={`px-2 py-1 rounded flex-row items-center gap-1 ${
              showPartials ? "bg-primary" : "bg-base-300"
            }`}
          >
            <Ionicons
              name={showPartials ? "eye-off-outline" : "eye-outline"}
              size={14}
              color={showPartials ? "#ffffff" : "#6b7280"}
            />
            <Text
              className={`${
                showPartials ? "text-primary-content" : "text-base-content"
              } text-xs font-medium`}
            >
              {showPartials ? "Hide Partials" : "Show Partials"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="gap-3">
        {/* Quick Rep Buttons (only for regular, not unilateral) */}
        {!currentSet.is_unilateral && (
          <View className="mb-2">
            <Text className="text-xs text-muted mb-1">Quick Reps</Text>
            <View className="flex-row gap-2">
              {quickReps.map((reps) => (
                <TouchableOpacity
                  key={reps}
                  onPress={() => handleQuickRep(reps)}
                  className={`px-3 py-2 rounded-lg border ${
                    currentSet.reps === reps
                      ? "bg-primary border-primary"
                      : "bg-base-300 border-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      currentSet.reps === reps
                        ? "text-primary-content"
                        : "text-base-content"
                    }`}
                  >
                    {reps}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
                currentSet.partialReps !== null && currentSet.partialReps > 0
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
            isSetComplete ? "bg-primary" : "bg-base-300"
          }`}
          style={{
            shadowColor: isSetComplete ? "#ff4b8c" : "transparent",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isSetComplete ? 0.3 : 0,
            shadowRadius: 8,
            elevation: isSetComplete ? 8 : 0,
          }}
          onPress={onAddSet}
          disabled={!isSetComplete}
        >
          <Ionicons
            name="add-circle"
            size={20}
            color={isSetComplete ? "#ffffff" : "#6b7280"}
          />
          <Text
            className={`text-center font-bold ml-2 ${
              isSetComplete ? "text-primary-content" : "text-muted"
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
