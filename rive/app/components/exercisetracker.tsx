import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Exercise = {
  id: number;
  name: string;
  category: string;
};

type ExerciseSet = {
  id?: string;
  reps: number | null;
  weight: number | null;
  partialReps: number | null;
  set_number: number;
};

type ExerciseTrackerProps = {
  exercise: Exercise;
  onComplete: (sets: ExerciseSet[]) => void;
  onBack: () => void;
  initialSets?: ExerciseSet[];
};

const ExerciseTracker = ({
  exercise,
  onComplete,
  onBack,
  initialSets = [],
}: ExerciseTrackerProps) => {
  const [sets, setSets] = useState<ExerciseSet[]>(initialSets);
  const [currentSet, setCurrentSet] = useState<ExerciseSet>({
    reps: null,
    weight: null,
    partialReps: null,
    set_number: sets.length + 1,
  });
  const [weightIncrement, setWeightIncrement] = useState<number>(5);
  const insets = useSafeAreaInsets();

  const handleAddSet = () => {
    if (currentSet.reps === null || currentSet.weight === null) {
      Alert.alert("Incomplete Set", "Please enter reps and weight");
      return;
    }

    const newSet = { ...currentSet };
    setSets([...sets, newSet]);

    // Reset for next set
    setCurrentSet({
      reps: null,
      weight: null,
      partialReps: null,
      set_number: sets.length + 2,
    });
  };

  const handleComplete = () => {
    onComplete(sets);
  };

  const handleCopyLastSet = () => {
    if (sets.length > 0) {
      const lastSet = sets[sets.length - 1];
      setCurrentSet({
        reps: lastSet.reps,
        weight: lastSet.weight,
        partialReps: lastSet.partialReps,
        set_number: sets.length + 1,
      });
    }
  };

  const removeSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between p-4 border-b border-gray-200"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <TouchableOpacity onPress={onBack}>
          <Text className="text-blue-500 text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-gray-900">
            {formatExerciseName(exercise.name)}
          </Text>
          <Text className="text-sm text-gray-600">{exercise.category}</Text>
        </View>
        <TouchableOpacity
          className="px-3 py-1 bg-blue-500 rounded"
          onPress={handleComplete}
          disabled={sets.length === 0}
        >
          <Text className="text-white text-sm">✓ Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Current Set Input */}
        <View className="bg-gray-100 rounded-lg p-4 mb-4">
          <Text className="text-sm font-medium text-gray-900 mb-3">
            Set {currentSet.set_number}
          </Text>

          <View className="flex-row space-x-3">
            {/* Reps */}
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1">Reps</Text>
              <View className="bg-white rounded-lg flex-row items-center">
                <TouchableOpacity
                  className="px-3 py-2"
                  onPress={() => {
                    const newValue = (currentSet.reps || 0) - 1;
                    if (newValue >= 0) {
                      setCurrentSet({ ...currentSet, reps: newValue });
                    }
                  }}
                >
                  <Text className="text-gray-600">-</Text>
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center py-2"
                  value={
                    currentSet.reps !== null ? currentSet.reps.toString() : ""
                  }
                  onChangeText={(value) => {
                    if (value === "" || value === "-") {
                      setCurrentSet({ ...currentSet, reps: null });
                    } else {
                      const parsed = parseInt(value);
                      if (!isNaN(parsed)) {
                        setCurrentSet({ ...currentSet, reps: parsed });
                      }
                    }
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  className="px-3 py-2"
                  onPress={() =>
                    setCurrentSet({
                      ...currentSet,
                      reps: (currentSet.reps || 0) + 1,
                    })
                  }
                >
                  <Text className="text-gray-600">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Weight */}
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1">Weight (lbs)</Text>
              <View className="bg-white rounded-lg flex-row items-center">
                <TouchableOpacity
                  className="px-3 py-2"
                  onPress={() => {
                    const newValue = (currentSet.weight || 0) - weightIncrement;
                    if (newValue >= 0) {
                      setCurrentSet({ ...currentSet, weight: newValue });
                    }
                  }}
                >
                  <Text className="text-gray-600">-</Text>
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center py-2"
                  value={
                    currentSet.weight !== null
                      ? currentSet.weight.toString()
                      : ""
                  }
                  onChangeText={(value) => {
                    if (value === "" || value === "-" || value === ".") {
                      setCurrentSet({ ...currentSet, weight: null });
                    } else {
                      const parsed = parseFloat(value);
                      if (!isNaN(parsed)) {
                        const rounded = Math.floor(parsed * 10) / 10;
                        setCurrentSet({ ...currentSet, weight: rounded });
                      }
                    }
                  }}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  className="px-3 py-2"
                  onPress={() =>
                    setCurrentSet({
                      ...currentSet,
                      weight: (currentSet.weight || 0) + weightIncrement,
                    })
                  }
                >
                  <Text className="text-gray-600">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Partial Reps */}
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1">Partials</Text>
              <View className="bg-white rounded-lg flex-row items-center">
                <TouchableOpacity
                  className="px-3 py-2"
                  onPress={() => {
                    const newValue = (currentSet.partialReps || 0) - 1;
                    if (newValue >= 0) {
                      setCurrentSet({ ...currentSet, partialReps: newValue });
                    }
                  }}
                >
                  <Text className="text-gray-600">-</Text>
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center py-2"
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
                  keyboardType="numeric"
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
                  <Text className="text-gray-600">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Weight Increment Tabs */}
          <View className="flex-row bg-white rounded-lg p-1 mt-3">
            <TouchableOpacity
              className={`flex-1 py-2 rounded ${
                weightIncrement === 2.5 ? "bg-blue-500" : "bg-transparent"
              }`}
              onPress={() => setWeightIncrement(2.5)}
            >
              <Text
                className={`text-center text-sm ${
                  weightIncrement === 2.5 ? "text-white" : "text-gray-700"
                }`}
              >
                2.5lbs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded ${
                weightIncrement === 5 ? "bg-blue-500" : "bg-transparent"
              }`}
              onPress={() => setWeightIncrement(5)}
            >
              <Text
                className={`text-center text-sm ${
                  weightIncrement === 5 ? "text-white" : "text-gray-700"
                }`}
              >
                5lbs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded ${
                weightIncrement === 10 ? "bg-blue-500" : "bg-transparent"
              }`}
              onPress={() => setWeightIncrement(10)}
            >
              <Text
                className={`text-center text-sm ${
                  weightIncrement === 10 ? "text-white" : "text-gray-700"
                }`}
              >
                10lbs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-2 mt-3">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${
                currentSet.reps === null || currentSet.weight === null
                  ? "bg-gray-400"
                  : "bg-blue-500"
              }`}
              onPress={handleAddSet}
              disabled={currentSet.reps === null || currentSet.weight === null}
            >
              <Text className="text-white text-center font-medium">
                + Add Set
              </Text>
            </TouchableOpacity>
            {sets.length > 0 && (
              <TouchableOpacity
                className="px-4 py-2 border border-blue-500 rounded-lg"
                onPress={handleCopyLastSet}
              >
                <Text className="text-blue-500 text-center">Copy Last</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Completed Sets */}
        {sets.length > 0 && (
          <View className="bg-gray-100 rounded-lg p-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Completed Sets ({sets.length})
            </Text>
            <View className="space-y-2">
              {sets.map((set, index) => (
                <View
                  key={index}
                  className="bg-white rounded-lg p-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-sm font-medium text-gray-900">
                      Set {set.set_number}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {set.reps} reps
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {set.weight} lbs
                    </Text>
                    {set.partialReps && set.partialReps > 0 && (
                      <Text className="text-sm text-gray-500">
                        +{set.partialReps} partials
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => removeSet(index)}
                    className="p-1"
                  >
                    <Text className="text-red-500 text-lg">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExerciseTracker;
