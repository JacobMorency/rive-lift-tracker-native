import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../ui/AppCard";
import AppText from "../ui/AppText";
import AppButton from "../ui/AppButton";

export type HeroWorkout = {
  id: string;
  name: string;
  description: string | null;
  exercise_count: number;
};

type SelectWorkoutHeroCardProps = {
  workout: HeroWorkout;
  onStart: () => void;
};

export default function SelectWorkoutHeroCard({
  workout,
  onStart,
}: SelectWorkoutHeroCardProps) {
  return (
    <AppCard
      radius="large"
      className="border border-primary/10 dark:border-primary-dark/20 p-6 mb-2"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="self-end mb-4">
        <View className="rounded-full bg-primary dark:bg-primary-dark px-3 py-1">
          <AppText
            variant="caption"
            tone="inverse"
            className="text-[10px] font-bold normal-case tracking-widest"
          >
            Today&apos;s goal
          </AppText>
        </View>
      </View>

      <View className="flex-row justify-between items-end gap-4 mb-5">
        <View className="flex-1 min-w-0">
          <AppText variant="subheader" className="mb-1">
            {workout.name}
          </AppText>
          {workout.description ? (
            <AppText variant="caption" tone="muted" className="normal-case">
              {workout.description}
            </AppText>
          ) : (
            <AppText variant="caption" tone="muted" className="normal-case">
              Scheduled for today
            </AppText>
          )}
        </View>
        <View className="items-end shrink-0">
          <AppText variant="subheader" tone="primary" className="leading-none">
            {workout.exercise_count}
          </AppText>
          <AppText
            variant="caption"
            tone="muted"
            className="text-[10px] font-bold normal-case tracking-widest mt-0.5"
          >
            Exercises
          </AppText>
        </View>
      </View>

      <AppButton
        tone="primary"
        size="lg"
        fullWidth
        label="Start session"
        onPress={onStart}
        icon={<Ionicons name="play" size={22} color="#ffffff" />}
        className="shadow-md shadow-primary/30"
      />
    </AppCard>
  );
}
