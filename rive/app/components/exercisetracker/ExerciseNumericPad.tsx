import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";
import type { PadField } from "./exercisePadUtils";

type ExerciseNumericPadProps = {
  activeField: PadField;
  onClear: () => void;
  onDone: () => void;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onWeightNudge: (delta: number) => void;
};

const NUDGES = [2.5, 5, 10] as const;

export default function ExerciseNumericPad({
  activeField,
  onClear,
  onDone,
  onDigit,
  onBackspace,
  onWeightNudge,
}: ExerciseNumericPadProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const keyBg =
    "bg-surfaceAlt dark:bg-surfaceAlt-dark active:opacity-80";
  const iconColor = isDark ? "#f5f5f5" : "#111113";

  const showDecimal = activeField === "weight";

  return (
    <View
      className="border-t border-border dark:border-border-dark bg-background dark:bg-background-dark"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={onClear} hitSlop={8} className="py-2 px-1">
          <AppText variant="caption" tone="muted" className="font-bold normal-case tracking-wider">
            Clear
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDone}
          className="bg-primary dark:bg-primary-dark px-5 py-2.5 rounded-ds-control active:opacity-90"
        >
          <AppText variant="caption" tone="inverse" className="font-bold normal-case">
            Done
          </AppText>
        </TouchableOpacity>
      </View>

      {activeField === "weight" ? (
        <View className="flex-row justify-center gap-2 px-4 pb-2">
          {NUDGES.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => onWeightNudge(d)}
              className="px-3 py-2 rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
            >
              <AppText variant="caption" tone="primary" className="font-semibold normal-case">
                +{d}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View className="px-4 pb-2">
        <View className="flex-row gap-2 mb-2">
          {["1", "2", "3"].map((d) => (
            <TouchableOpacity
              key={d}
              className={`flex-1 h-14 rounded-xl items-center justify-center ${keyBg}`}
              onPress={() => onDigit(d)}
            >
              <AppText variant="subheader" tone="default" className="font-bold">
                {d}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row gap-2 mb-2">
          {["4", "5", "6"].map((d) => (
            <TouchableOpacity
              key={d}
              className={`flex-1 h-14 rounded-xl items-center justify-center ${keyBg}`}
              onPress={() => onDigit(d)}
            >
              <AppText variant="subheader" tone="default" className="font-bold">
                {d}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row gap-2 mb-2">
          {["7", "8", "9"].map((d) => (
            <TouchableOpacity
              key={d}
              className={`flex-1 h-14 rounded-xl items-center justify-center ${keyBg}`}
              onPress={() => onDigit(d)}
            >
              <AppText variant="subheader" tone="default" className="font-bold">
                {d}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`flex-1 h-14 rounded-xl items-center justify-center ${keyBg} ${
              !showDecimal ? "opacity-40" : ""
            }`}
            onPress={() => showDecimal && onDigit(".")}
            disabled={!showDecimal}
          >
            <AppText variant="subheader" tone="default" className="font-bold">
              .
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 h-14 rounded-xl items-center justify-center ${keyBg}`}
            onPress={() => onDigit("0")}
          >
            <AppText variant="subheader" tone="default" className="font-bold">
              0
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 h-14 rounded-xl items-center justify-center ${keyBg}`}
            onPress={onBackspace}
          >
            <Ionicons name="backspace-outline" size={22} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
