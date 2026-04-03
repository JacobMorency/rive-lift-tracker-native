import React, { useMemo } from "react";
import { View } from "react-native";
import { ExerciseSet as StatsExerciseSet } from "../../lib/statsUtils";
import { ExerciseSet } from "./types";
import AppText from "../ui/AppText";

function volumeLocal(set: ExerciseSet): number {
  const w = set.weight;
  if (w === null || w === undefined) return 0;
  if (set.is_unilateral) {
    return w * ((set.left_reps || 0) + (set.right_reps || 0));
  }
  return w * (set.reps || 0);
}

function totalVolumeLocal(sets: ExerciseSet[]): number {
  return sets.reduce((t, s) => t + volumeLocal(s), 0);
}

function volumeStatsSet(s: StatsExerciseSet): number {
  const w = s.weight ?? 0;
  if (!w) return 0;
  if (s.is_unilateral) {
    return w * ((s.left_reps || 0) + (s.right_reps || 0));
  }
  return w * (s.reps || 0);
}

function totalVolumeStats(sets: StatsExerciseSet[]): number {
  return sets.reduce((t, s) => t + volumeStatsSet(s), 0);
}

function bestSetSummary(sets: StatsExerciseSet[]): {
  weight: number;
  repsLabel: string;
} | null {
  if (!sets.length) return null;
  let best: StatsExerciseSet | null = null;
  let bestVol = -1;
  for (const s of sets) {
    const v = volumeStatsSet(s);
    if (v > bestVol) {
      bestVol = v;
      best = s;
    }
  }
  if (!best || bestVol <= 0) return null;
  const w = best.weight ?? 0;
  if (best.is_unilateral) {
    return {
      weight: w,
      repsLabel: `L ${best.left_reps ?? 0} · R ${best.right_reps ?? 0}`,
    };
  }
  return { weight: w, repsLabel: `/ ${best.reps ?? 0} reps` };
}

type ComparisonBentoProps = {
  lastSessionSets: StatsExerciseSet[];
  completedSets: ExerciseSet[];
};

export default function ComparisonBento({
  lastSessionSets,
  completedSets,
}: ComparisonBentoProps) {
  const lastTotal = useMemo(
    () => totalVolumeStats(lastSessionSets),
    [lastSessionSets],
  );
  const currentTotal = useMemo(
    () => totalVolumeLocal(completedSets),
    [completedSets],
  );
  const delta = currentTotal - lastTotal;
  const best = useMemo(
    () => bestSetSummary(lastSessionSets),
    [lastSessionSets],
  );

  if (lastSessionSets.length === 0) {
    return null;
  }

  const hasCurrentData = completedSets.some(
    (s) =>
      (s.weight ?? 0) > 0 ||
      (s.reps ?? 0) > 0 ||
      (s.left_reps ?? 0) > 0 ||
      (s.right_reps ?? 0) > 0,
  );

  return (
    <View className="flex-row gap-3 mb-6">
      <View className="flex-1 bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-2xl border border-border dark:border-border-dark p-4">
        <AppText
          variant="caption"
          tone="muted"
          className="normal-case tracking-wider text-[10px] mb-1 font-bold"
        >
          Total volume
        </AppText>
        <View className="flex-row items-end gap-2 flex-wrap">
          <AppText variant="subheader" tone="default" className="font-bold text-xl">
            {currentTotal.toLocaleString()} lbs
          </AppText>
          {hasCurrentData && lastTotal > 0 ? (
            <AppText
              variant="caption"
              tone={delta >= 0 ? "primary" : "default"}
              className={`text-xs font-semibold pb-0.5 ${delta < 0 ? "text-error" : ""}`}
            >
              {delta >= 0 ? "+" : ""}
              {delta.toLocaleString()} lbs
            </AppText>
          ) : null}
        </View>
      </View>
      <View className="flex-1 bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-2xl border border-border dark:border-border-dark p-4">
        <AppText
          variant="caption"
          tone="muted"
          className="normal-case tracking-wider text-[10px] mb-1 font-bold"
        >
          Best set (last)
        </AppText>
        {best ? (
          <View className="flex-row items-end gap-2 flex-wrap">
            <AppText variant="subheader" tone="default" className="font-bold text-xl">
              {best.weight} lbs
            </AppText>
            <AppText variant="caption" tone="muted" className="text-xs pb-0.5 normal-case">
              {best.repsLabel}
            </AppText>
          </View>
        ) : (
          <AppText variant="body" tone="muted" className="text-sm normal-case">
            —
          </AppText>
        )}
      </View>
    </View>
  );
}
