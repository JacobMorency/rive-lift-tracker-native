import type { ExerciseSet } from "./types";

export type PadField = "weight" | "reps" | "leftReps" | "rightReps";

export function formatWeightDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}

export function formatRepsDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}

export function valueToBuffer(
  field: PadField,
  set: {
    weight: number | null;
    reps: number | null;
    left_reps?: number | null;
    right_reps?: number | null;
  },
): string {
  if (field === "weight") {
    if (set.weight === null || set.weight === undefined) return "";
    return String(set.weight);
  }
  if (field === "reps") {
    if (set.reps === null || set.reps === undefined) return "";
    return String(set.reps);
  }
  if (field === "leftReps") {
    if (set.left_reps === null || set.left_reps === undefined) return "";
    return String(set.left_reps);
  }
  if (set.right_reps === null || set.right_reps === undefined) return "";
  return String(set.right_reps);
}

export function parseWeightBuffer(buffer: string): number | null {
  const t = buffer.trim();
  if (t === "" || t === "." || t === "-") return null;
  const p = parseFloat(t);
  if (Number.isNaN(p)) return null;
  return Math.floor(p * 10) / 10;
}

export function parseRepsBuffer(buffer: string): number | null {
  const t = buffer.trim();
  if (t === "" || t === "-") return null;
  const p = parseInt(t, 10);
  if (Number.isNaN(p)) return null;
  return p;
}

export function applyBufferToSet(
  set: ExerciseSet,
  field: PadField,
  buffer: string,
): ExerciseSet {
  const next = { ...set };
  if (field === "weight") {
    next.weight = parseWeightBuffer(buffer);
  } else if (field === "reps") {
    next.reps = parseRepsBuffer(buffer);
  } else if (field === "leftReps") {
    next.left_reps = parseRepsBuffer(buffer);
  } else {
    next.right_reps = parseRepsBuffer(buffer);
  }
  return next;
}

export function appendPadKey(buffer: string, key: string, field: PadField): string {
  if (key === "backspace") {
    return buffer.slice(0, -1);
  }
  if (field === "weight") {
    if (key === ".") {
      if (buffer.includes(".")) return buffer;
      return buffer === "" ? "0." : `${buffer}.`;
    }
    if (!/^\d$/.test(key)) return buffer;
    const parts = buffer.split(".");
    if (parts[1] !== undefined && parts[1].length >= 1) return buffer;
    return buffer + key;
  }
  if (!/^\d$/.test(key)) return buffer;
  if (buffer === "0") return key === "0" ? "0" : key;
  return buffer + key;
}

/** Approximate height for ScrollView padding (pad + safe area handled separately). */
export const EXERCISE_PAD_EXTRA_PADDING = 300;
