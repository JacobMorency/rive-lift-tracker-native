import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScheduledWorkout } from "../../lib/scheduleUtils";
import AppText from "../ui/AppText";
import SelectWorkoutCard from "./SelectWorkoutCard";
import SelectWorkoutHeroCard from "./SelectWorkoutHeroCard";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercise_count: number;
};

type SelectWorkoutListProps = {
  workoutTemplates: WorkoutTemplate[];
  scheduledWorkouts: ScheduledWorkout[];
  onWorkoutSelect: (workoutId: string) => void;
  onNewTemplatePress?: () => void;
};

const sectionLabelClass =
  "uppercase tracking-widest font-semibold text-[10px] leading-none";

export default function SelectWorkoutList({
  workoutTemplates,
  scheduledWorkouts,
  onWorkoutSelect,
  onNewTemplatePress,
}: SelectWorkoutListProps) {
  const firstScheduled = scheduledWorkouts[0];
  const heroWorkout = firstScheduled
    ? workoutTemplates.find((w) => w.id === firstScheduled.schedule.workout_id)
    : undefined;
  const restScheduled = scheduledWorkouts.slice(1);

  const scheduledIds = new Set(
    scheduledWorkouts.map((sw) => sw.schedule.workout_id),
  );
  const showHeroCard = Boolean(heroWorkout);

  return (
    <View className="gap-10">
      {scheduledWorkouts.length > 0 && (
        <View>
          <AppText
            variant="caption"
            tone="muted"
            className={`${sectionLabelClass} mb-4 normal-case`}
          >
            Scheduled for today
          </AppText>

          {heroWorkout ? (
            <SelectWorkoutHeroCard
              workout={heroWorkout}
              onStart={() => onWorkoutSelect(heroWorkout.id)}
            />
          ) : null}

          {restScheduled.map((scheduledWorkout) => {
            const workout = workoutTemplates.find(
              (w) => w.id === scheduledWorkout.schedule.workout_id,
            );
            if (!workout) return null;
            return (
              <SelectWorkoutCard
                key={`scheduled-extra-${workout.id}`}
                workout={workout}
                layoutVariant="compactScheduled"
                onPress={() => onWorkoutSelect(workout.id)}
              />
            );
          })}
        </View>
      )}

      <View className={showHeroCard ? "" : "pt-10"}>
        <View className="flex-row items-center justify-between border-b border-border dark:border-border-dark pb-4 mb-6">
          <AppText
            variant="caption"
            tone="muted"
            className={`${sectionLabelClass} normal-case`}
          >
            All workout templates
          </AppText>
          {onNewTemplatePress ? (
            <TouchableOpacity
              onPress={onNewTemplatePress}
              className="flex-row items-center gap-1 active:opacity-80"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add" size={16} color="#ff4b8c" />
              <AppText
                variant="caption"
                tone="primary"
                className="font-bold normal-case tracking-widest text-[10px]"
              >
                New
              </AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="gap-4">
          {workoutTemplates.map((workout) => {
            if (scheduledIds.has(workout.id)) return null;
            return (
              <SelectWorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() => onWorkoutSelect(workout.id)}
              />
            );
          })}

          {onNewTemplatePress ? (
            <TouchableOpacity
              onPress={onNewTemplatePress}
              activeOpacity={0.85}
              className="rounded-ds-card border-2 border-dashed border-border dark:border-border-dark py-8 px-6 items-center gap-3 opacity-80"
            >
              <View className="w-12 h-12 rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark items-center justify-center">
                <Ionicons name="add-circle-outline" size={28} color="#a1a1aa" />
              </View>
              <AppText
                variant="caption"
                tone="muted"
                className="font-bold normal-case tracking-widest text-center"
              >
                Create empty workout
              </AppText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}
