import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type WeightInputProps = {
  value: number | null;
  textInputValue?: string;
  onChange: (value: number | null) => void;
  onTextChange?: (value: string) => void;
  weightIncrement: number;
  variant?: "form" | "edit";
};

export default function WeightInput({
  value,
  textInputValue,
  onChange,
  onTextChange,
  weightIncrement,
  variant = "form",
}: WeightInputProps) {
  const isFormVariant = variant === "form";
  const containerClassName = isFormVariant
    ? "rounded-xl flex-row items-center"
    : "flex-row items-center bg-gray-50 dark:bg-zinc-800 rounded-lg";
  const buttonClassName = isFormVariant ? "px-3 py-2" : "px-3 py-2";
  const inputClassName = isFormVariant
    ? "flex-1 text-center py-2 text-lg font-bold text-zinc-900 dark:text-white"
    : "flex-1 text-center py-2 text-base font-bold text-zinc-900 dark:text-white";
  const iconSize = isFormVariant ? 18 : 16;

  const displayValue =
    isFormVariant && textInputValue !== undefined
      ? textInputValue
      : value !== null
        ? value.toString()
        : "";

  const handleTextChange = (textValue: string) => {
    if (isFormVariant && onTextChange) {
      onTextChange(textValue);
      if (
        textValue === "" ||
        textValue === "-" ||
        textValue === "." ||
        /\.$/.test(textValue)
      ) {
        onChange(null);
        return;
      }
      const parsed = parseFloat(textValue);
      if (!isNaN(parsed)) {
        const rounded = Math.floor(parsed * 10) / 10;
        onChange(rounded);
      }
    } else {
      // Edit mode
      if (textValue === "" || textValue === "-" || textValue === ".") {
        onChange(null);
      } else {
        const parsed = parseFloat(textValue);
        if (!isNaN(parsed)) {
          const rounded = Math.floor(parsed * 10) / 10;
          onChange(rounded);
        }
      }
    }
  };

  const handleDecrement = () => {
    // If value is null, set it to 0 (for bodyweight exercises)
    // Otherwise, decrement by weightIncrement
    if (value === null) {
      onChange(0);
      if (isFormVariant && onTextChange) {
        onTextChange("0");
      }
    } else {
      const newValue = value - weightIncrement;
      if (newValue >= 0) {
        onChange(newValue);
        if (isFormVariant && onTextChange) {
          onTextChange(newValue.toString());
        }
      }
    }
  };

  const handleIncrement = () => {
    const newValue = (value || 0) + weightIncrement;
    onChange(newValue);
    if (isFormVariant && onTextChange) {
      onTextChange(newValue.toString());
    }
  };

  return (
    <View className="flex-1">
      <View className="mb-1">
        <Text
          className={
            isFormVariant
              ? "text-sm font-semibold text-zinc-900 dark:text-white"
              : "text-xs text-gray-500 dark:text-gray-400"
          }
        >
          Weight (lbs)
        </Text>
      </View>
      <View
        className={`${containerClassName} ${
          isFormVariant
            ? value !== null
              ? "bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10 border-2 border-[#ff4b8c] dark:border-[#ff6fa1]"
              : "bg-gray-100 dark:bg-zinc-700 border-2 border-transparent"
            : ""
        }`}
      >
        <TouchableOpacity className={buttonClassName} onPress={handleDecrement}>
          <Ionicons
            name="remove"
            size={iconSize}
            color={
              isFormVariant
                ? value !== null
                  ? "#ff4b8c"
                  : "#6b7280"
                : "#6b7280"
            }
          />
        </TouchableOpacity>
        <TextInput
          className={inputClassName}
          value={displayValue}
          onChangeText={handleTextChange}
          placeholder="0"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          returnKeyType="done"
          blurOnSubmit={true}
        />
        <TouchableOpacity className={buttonClassName} onPress={handleIncrement}>
          <Ionicons
            name="add"
            size={iconSize}
            color={
              isFormVariant
                ? value !== null
                  ? "#ff4b8c"
                  : "#6b7280"
                : "#6b7280"
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

