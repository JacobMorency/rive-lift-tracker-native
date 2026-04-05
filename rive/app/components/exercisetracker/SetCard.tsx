import React from "react";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseSet } from "./types";
import AppText from "../ui/AppText";

type SetCardProps = {
  set: ExerciseSet;
  originalIndex: number;
  editingSetIndex: number | null;
  onEdit: () => void;
  onDelete: () => void;
};

function formatLineWeightReps(weight: number | null | undefined, reps: number | null | undefined) {
  const w = weight != null ? `${weight}` : "—";
  const r = reps != null ? `${reps}` : "—";
  return `${w} lbs × ${r}`;
}

export default function SetCard({
  set,
  originalIndex,
  editingSetIndex,
  onEdit,
  onDelete,
}: SetCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primary = isDark ? "#ff6fa1" : "#ff4b8c";

  const isHighlighted = editingSetIndex === originalIndex;
  const num = set.set_number ?? originalIndex + 1;
  const numLabel = num < 10 ? `0${num}` : String(num);

  return (
    <View
      className={`rounded-2xl border p-4 flex-row items-center justify-between gap-3 ${
        isHighlighted
          ? "bg-primary/10 dark:bg-primary-dark/10 border-primary/30 dark:border-primary-dark/30"
          : "bg-surfaceAlt/50 dark:bg-surfaceAlt-dark/50 border-border/40 dark:border-border-dark/40"
      }`}
    >
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.85}
        className="flex-1 flex-row items-center gap-4 min-w-0"
      >
        <View
          className={`w-8 h-8 rounded-full items-center justify-center border shrink-0 ${
            isHighlighted
              ? "bg-primary/15 dark:bg-primary-dark/15 border-primary/25 dark:border-primary-dark/25"
              : "bg-surface dark:bg-surface-dark border-border dark:border-border-dark"
          }`}
        >
          <AppText
            variant="caption"
            tone={isHighlighted ? "primary" : "muted"}
            className="text-[10px] font-black"
          >
            {numLabel}
          </AppText>
        </View>
        <View className="flex-1 min-w-0 gap-0.5">
          {set.is_unilateral ? (
            <>
              <View className="flex-row items-center gap-2 flex-wrap">
                <AppText variant="caption" tone="muted" className="text-[9px] font-bold uppercase">
                  L:
                </AppText>
                <AppText variant="body" tone="default" className="text-sm font-bold">
                  {formatLineWeightReps(set.weight, set.left_reps)}
                </AppText>
              </View>
              <View className="flex-row items-center gap-2 flex-wrap">
                <AppText variant="caption" tone="muted" className="text-[9px] font-bold uppercase">
                  R:
                </AppText>
                <AppText variant="body" tone="default" className="text-sm font-bold">
                  {formatLineWeightReps(set.weight, set.right_reps)}
                </AppText>
              </View>
            </>
          ) : (
            <AppText variant="body" tone="default" className="text-sm font-bold">
              {formatLineWeightReps(set.weight, set.reps)}
            </AppText>
          )}
        </View>
      </TouchableOpacity>
      <View className="flex-row items-center gap-1 shrink-0">
        <Ionicons name="checkmark-circle" size={22} color={primary} />
        <TouchableOpacity onPress={onDelete} className="p-2" accessibilityLabel="Delete set">
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
