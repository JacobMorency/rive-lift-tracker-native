import React from "react";
import { View, Text } from "react-native";
import SelectWorkoutCard from "./SelectWorkoutCard";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercise_count: number;
};

type ScheduledWorkout = {
  schedule: {
    workout_id: string;
  };
};

type SelectWorkoutListProps = {
  workoutTemplates: WorkoutTemplate[];
  scheduledWorkouts: ScheduledWorkout[];
  onWorkoutSelect: (workoutId: string) => void;
};

export default function SelectWorkoutList({
  workoutTemplates,
  scheduledWorkouts,
  onWorkoutSelect,
}: SelectWorkoutListProps) {
  return (
    <View className="gap-3">
      {/* Scheduled Workouts Section */}
      {scheduledWorkouts.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            Scheduled for Today
          </Text>
          {scheduledWorkouts.map((scheduledWorkout) => {
            const workout = workoutTemplates.find(
              (w) => w.id === scheduledWorkout.schedule.workout_id
            );
            if (!workout) return null;

            return (
              <SelectWorkoutCard
                key={`scheduled-${workout.id}`}
                workout={workout}
                isScheduled={true}
                onPress={() => onWorkoutSelect(workout.id)}
              />
            );
          })}
        </View>
      )}

      {/* All Workout Templates Section */}
      <View>
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
          All Workout Templates
        </Text>
        {workoutTemplates.map((workout) => {
          // Skip if this workout is already shown in scheduled section
          const isScheduled = scheduledWorkouts.some(
            (sw) => sw.schedule.workout_id === workout.id
          );
          if (isScheduled) return null;

          return (
            <SelectWorkoutCard
              key={workout.id}
              workout={workout}
              isScheduled={false}
              onPress={() => onWorkoutSelect(workout.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

