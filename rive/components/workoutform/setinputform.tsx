import { View, Text, TextInput } from "react-native";
import AddSetButtons, { AddSetButtonProps } from "../workoutform/addsetbuttons";
import { NullableNumber } from "../../types/workout";
import { useState, useEffect } from "react";

type SetInputFormProps = AddSetButtonProps & {
  reps: NullableNumber;
  weight: NullableNumber;
  partialReps: NullableNumber;
  setReps: (value: NullableNumber) => void;
  setWeight: (value: NullableNumber) => void;
  setPartialReps: (value: NullableNumber) => void;
  repsEmpty: boolean;
  weightEmpty: boolean;
  partialRepsInvalid: boolean;
  weightInvalid: boolean;
  repsInvalid: boolean;
};

const SetInputForm = (props: SetInputFormProps) => {
  const {
    reps,
    weight,
    partialReps,
    setReps,
    setWeight,
    setPartialReps,
    repsEmpty,
    weightEmpty,
    partialRepsInvalid,
    weightInvalid,
    repsInvalid,
  } = props;

  const [weightText, setWeightText] = useState<string>("");

  useEffect(() => {
    if (weight === null) {
      setWeightText("");
    } else {
      setWeightText(weight.toString());
    }
  }, [weight]);

  return (
    <View>
      <View className="flex-row gap-3 w-full">
        <View className="flex-1">
          <Text className="text-base-content mb-1">Reps</Text>
          <TextInput
            keyboardType="number-pad"
            value={reps !== null ? reps.toString() : ""}
            onChangeText={(val) =>
              setReps(val !== "" ? parseInt(val, 10) : null)
            }
            placeholder="0"
            className={`${
              repsEmpty || repsInvalid
                ? "border border-error"
                : "border border-gray"
            } rounded px-2 py-1 text-base-content bg-base-100`}
            placeholderTextColor="#57534e"
            returnKeyType="done"
          />
          {repsEmpty && (
            <Text className="text-error italic text-sm">Reps required</Text>
          )}
          {repsInvalid && (
            <Text className="text-error italic text-sm">
              Invalid amount of reps
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base-content mb-1">Weight</Text>
          <TextInput
            keyboardType="decimal-pad"
            value={weightText}
            onChangeText={(val) => {
              setWeightText(val);
              const parsed = parseFloat(val);
              if (!isNaN(parsed)) {
                const rounded = Math.floor(parsed * 10) / 10;
                setWeight(rounded);
              } else {
                setWeight(null);
              }
            }}
            placeholder="0 (lbs)"
            className={`${
              weightEmpty || weightInvalid
                ? "border border-error"
                : "border border-gray"
            } rounded px-2 py-1 text-base-content bg-base-100`}
            placeholderTextColor="#57534e"
            returnKeyType="done"
          />
          {weightEmpty && (
            <Text className="text-error italic text-sm">Weight required</Text>
          )}
          {weightInvalid && (
            <Text className="text-error italic text-sm">
              Invalid amount of weight
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base-content mb-1">Partials</Text>
          <TextInput
            keyboardType="number-pad"
            value={partialReps !== null ? partialReps.toString() : ""}
            onChangeText={(val) =>
              setPartialReps(val !== "" ? parseInt(val, 10) : null)
            }
            placeholder="0 (optional)"
            className={`${
              partialRepsInvalid ? "border border-error" : "border border-gray"
            } rounded px-2 py-1 text-base-content bg-base-100`}
            placeholderTextColor="#57534e"
            returnKeyType="done"
          />
          {partialRepsInvalid && (
            <Text className="text-error italic text-sm">
              Invalid amount of partial reps
            </Text>
          )}
        </View>
      </View>
      <View className="mt-3">
        <AddSetButtons {...props} />
      </View>
    </View>
  );
};

export default SetInputForm;
