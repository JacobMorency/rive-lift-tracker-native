import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RepsInputProps = {
  value?: number | null;
  onChange?: (value: number | null) => void;
  isUnilateral?: boolean;
  leftValue?: number | null;
  rightValue?: number | null;
  onLeftChange?: (value: number | null) => void;
  onRightChange?: (value: number | null) => void;
  variant?: "form" | "edit";
};

export default function RepsInput({
  value,
  onChange,
  isUnilateral = false,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  variant = "form",
}: RepsInputProps) {
  const isFormVariant = variant === "form";
  const containerClassName = isFormVariant
    ? "rounded-xl flex-row items-center"
    : "flex-row items-center bg-base-200 rounded-lg";
  const buttonClassName = isFormVariant ? "px-3 py-3" : "px-2 py-2";
  const inputClassName = isFormVariant
    ? "flex-1 text-center py-3 text-base font-bold text-base-content"
    : "flex-1 text-center py-2 text-sm font-bold text-base-content";
  const iconSize = isFormVariant ? 18 : 14;

  if (isUnilateral) {
    return (
      <View className="gap-3">
        <View className="flex-row gap-3">
          {/* Left Reps */}
          <View className="flex-1">
            <View className={isFormVariant ? "mb-2" : "mb-1"}>
              <Text
                className={
                  isFormVariant
                    ? "text-sm font-semibold text-base-content"
                    : "text-xs text-muted"
                }
              >
                L Reps
              </Text>
            </View>
            <View
              className={`${containerClassName} ${
                isFormVariant
                  ? (leftValue ?? 0) > 0
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-base-300 border-2 border-transparent"
                  : ""
              }`}
            >
              <TouchableOpacity
                className={buttonClassName}
                onPress={() => {
                  if (onLeftChange) {
                    const newValue = (leftValue || 0) - 1;
                    if (newValue >= 0) {
                      onLeftChange(newValue);
                    }
                  }
                }}
              >
                <Ionicons
                  name="remove"
                  size={iconSize}
                  color={
                    isFormVariant
                      ? (leftValue ?? 0) > 0
                        ? "#ff4b8c"
                        : "#6b7280"
                      : "#6b7280"
                  }
                />
              </TouchableOpacity>
              <TextInput
                className={inputClassName}
                value={leftValue != null ? String(leftValue) : ""}
                onChangeText={(textValue) => {
                  if (onLeftChange) {
                    if (textValue === "" || textValue === "-") {
                      onLeftChange(null);
                    } else {
                      const parsed = parseInt(textValue);
                      if (!isNaN(parsed)) {
                        onLeftChange(parsed);
                      }
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
                className={buttonClassName}
                onPress={() => {
                  if (onLeftChange) {
                    onLeftChange((leftValue || 0) + 1);
                  }
                }}
              >
                <Ionicons
                  name="add"
                  size={iconSize}
                  color={
                    isFormVariant
                      ? (leftValue ?? 0) > 0
                        ? "#ff4b8c"
                        : "#6b7280"
                      : "#6b7280"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Right Reps */}
          <View className="flex-1">
            <View className={isFormVariant ? "mb-2" : "mb-1"}>
              <Text
                className={
                  isFormVariant
                    ? "text-sm font-semibold text-base-content"
                    : "text-xs text-muted"
                }
              >
                R Reps
              </Text>
            </View>
            <View
              className={`${containerClassName} ${
                isFormVariant
                  ? (rightValue ?? 0) > 0
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-base-300 border-2 border-transparent"
                  : ""
              }`}
            >
              <TouchableOpacity
                className={buttonClassName}
                onPress={() => {
                  if (onRightChange) {
                    const newValue = (rightValue || 0) - 1;
                    if (newValue >= 0) {
                      onRightChange(newValue);
                    }
                  }
                }}
              >
                <Ionicons
                  name="remove"
                  size={iconSize}
                  color={
                    isFormVariant
                      ? (rightValue ?? 0) > 0
                        ? "#ff4b8c"
                        : "#6b7280"
                      : "#6b7280"
                  }
                />
              </TouchableOpacity>
              <TextInput
                className={inputClassName}
                value={rightValue != null ? String(rightValue) : ""}
                onChangeText={(textValue) => {
                  if (onRightChange) {
                    if (textValue === "" || textValue === "-") {
                      onRightChange(null);
                    } else {
                      const parsed = parseInt(textValue);
                      if (!isNaN(parsed)) {
                        onRightChange(parsed);
                      }
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
                className={buttonClassName}
                onPress={() => {
                  if (onRightChange) {
                    onRightChange((rightValue || 0) + 1);
                  }
                }}
              >
                <Ionicons
                  name="add"
                  size={iconSize}
                  color={
                    isFormVariant
                      ? (rightValue ?? 0) > 0
                        ? "#ff4b8c"
                        : "#6b7280"
                      : "#6b7280"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Regular reps input
  return (
    <View className="flex-1">
      <View className={isFormVariant ? "mb-1" : "mb-1"}>
        <Text
          className={
            isFormVariant
              ? "text-sm font-semibold text-base-content"
              : "text-xs text-muted"
          }
        >
          Reps
        </Text>
      </View>
      <View
        className={`${containerClassName} ${
          isFormVariant
            ? value !== null && value > 0
              ? "bg-primary/10 border-2 border-primary"
              : "bg-base-300 border-2 border-transparent"
            : ""
        }`}
      >
        <TouchableOpacity
          className={isFormVariant ? "px-3 py-2" : "px-3 py-2"}
          onPress={() => {
            if (onChange) {
              const newValue = (value || 0) - 1;
              if (newValue >= 0) {
                onChange(newValue);
              }
            }
          }}
        >
          <Ionicons
            name="remove"
            size={isFormVariant ? 18 : 16}
            color={
              isFormVariant
                ? value !== null && value > 0
                  ? "#ff4b8c"
                  : "#6b7280"
                : "#6b7280"
            }
          />
        </TouchableOpacity>
        <TextInput
          className={
            isFormVariant
              ? "flex-1 text-center py-2 text-lg font-bold text-base-content"
              : "flex-1 text-center py-2 text-base font-bold text-base-content"
          }
          value={value != null ? value.toString() : ""}
          onChangeText={(textValue) => {
            if (onChange) {
              if (textValue === "" || textValue === "-") {
                onChange(null);
              } else {
                const parsed = parseInt(textValue);
                if (!isNaN(parsed)) {
                  onChange(parsed);
                }
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
          className={isFormVariant ? "px-3 py-2" : "px-3 py-2"}
          onPress={() => {
            if (onChange) {
              onChange((value || 0) + 1);
            }
          }}
        >
          <Ionicons
            name="add"
            size={isFormVariant ? 18 : 16}
            color={
              isFormVariant
                ? value !== null && value > 0
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

