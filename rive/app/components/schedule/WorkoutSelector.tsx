import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutTemplate } from "./types";
import AppText from "../ui/AppText";

type WorkoutSelectorProps = {
  templates: WorkoutTemplate[];
  selectedWorkoutId: string;
  onSelectWorkout: (id: string) => void;
};

export default function WorkoutSelector({
  templates,
  selectedWorkoutId,
  onSelectWorkout,
}: WorkoutSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";

  return (
    <View className="mb-8">
      <AppText variant="caption" tone="muted" className="mb-4 normal-case">
        Select workout template
      </AppText>
      <View className="gap-3">
        {templates.map((template) => {
          const selected = selectedWorkoutId === template.id;
          return (
            <TouchableOpacity
              key={template.id}
              activeOpacity={0.85}
              className={`flex-row items-center justify-between rounded-ds-card border p-4 ${
                selected
                  ? "border-primary/25 bg-primary/5 dark:border-primary-dark/30 dark:bg-primary-dark/10"
                  : "border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
              }`}
              onPress={() => onSelectWorkout(template.id)}
            >
              <View className="min-w-0 flex-1 pr-3">
                <AppText
                  variant="body"
                  tone="default"
                  className="font-semibold normal-case"
                  numberOfLines={2}
                >
                  {template.name}
                </AppText>
                {template.description ? (
                  <AppText
                    variant="caption"
                    tone="muted"
                    className="mt-1 normal-case"
                    numberOfLines={2}
                  >
                    {template.description}
                  </AppText>
                ) : null}
              </View>
              {selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={26}
                  color={primaryIcon}
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={24}
                  color={isDark ? "#52525b" : "#a1a1aa"}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
