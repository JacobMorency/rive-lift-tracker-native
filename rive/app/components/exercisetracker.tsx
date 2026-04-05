import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  type LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExerciseSet as StatsExerciseSet } from "../lib/statsUtils";
import { ExerciseSet } from "./exercisetracker/types";
import SetInputForm from "./exercisetracker/SetInputForm";
import CompletedSetsList from "./exercisetracker/CompletedSetsList";
import ExerciseNotes from "./exercisetracker/ExerciseNotes";
import ExerciseNumericPad from "./exercisetracker/ExerciseNumericPad";
import AppText from "./ui/AppText";
import type { PadField } from "./exercisetracker/exercisePadUtils";
import {
  appendPadKey,
  applyBufferToSet,
  parseWeightBuffer,
  valueToBuffer,
  EXERCISE_PAD_EXTRA_PADDING,
} from "./exercisetracker/exercisePadUtils";

type Exercise = {
  id: number;
  name: string;
  category: string;
  primaryMuscleGroup?: string;
  notes?: string | null;
  workoutExerciseId?: string;
};

type ExerciseTrackerProps = {
  exercise: Exercise;
  onComplete: (sets: ExerciseSet[]) => void;
  onBack: () => void;
  initialSets?: ExerciseSet[];
  lastSessionSets?: StatsExerciseSet[];
  onNotesUpdate?: (notes: string) => void;
};

type PadContext = { type: "active" } | { type: "edit"; index: number };

const SCROLL_SECTION_TOP_INSET = 8;
/** Scroll bottom inset when sticky save bar is visible (footer chrome; safe area is on the footer only). */
const STICKY_SAVE_FOOTER_SCROLL_PADDING = 68;

function lastSessionLineForSet(
  lastSessionSets: StatsExerciseSet[],
  setNum: number,
): string | null {
  const i = setNum - 1;
  if (i < 0 || i >= lastSessionSets.length) return null;
  const s = lastSessionSets[i];
  if (s.is_unilateral) {
    return `Last: L ${s.left_reps ?? "—"} · R ${s.right_reps ?? "—"} @ ${s.weight ?? "—"} lbs`;
  }
  return `Last: ${s.weight ?? "—"} lbs · ${s.reps ?? "—"} reps`;
}

function isSetCompleteForLog(set: ExerciseSet): boolean {
  return set.is_unilateral
    ? set.left_reps !== null &&
      set.right_reps !== null &&
      set.weight !== null &&
      set.weight >= 0
    : set.reps !== null &&
      set.reps !== 0 &&
      set.weight !== null &&
      set.weight >= 0;
}

function hasPartialSetInput(set: ExerciseSet): boolean {
  if (set.is_unilateral) {
    return (
      set.weight != null ||
      set.left_reps != null ||
      set.right_reps != null
    );
  }
  return set.weight != null || set.reps != null;
}

const ExerciseTracker = ({
  exercise,
  onComplete,
  onBack,
  initialSets = [],
  lastSessionSets = [],
  onNotesUpdate,
}: ExerciseTrackerProps) => {
  const [sets, setSets] = useState<ExerciseSet[]>(initialSets);
  const [currentSet, setCurrentSet] = useState<ExerciseSet>({
    reps: null,
    weight: null,
    partialReps: null,
    set_number: sets.length + 1,
    is_unilateral: false,
    left_reps: null,
    right_reps: null,
  });
  const [showAllSets, setShowAllSets] = useState<boolean>(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editingSet, setEditingSet] = useState<ExerciseSet | null>(null);
  const [padContext, setPadContext] = useState<PadContext>({ type: "active" });
  const [padOpen, setPadOpen] = useState(false);
  const [padField, setPadField] = useState<PadField>("weight");
  const [padBuffer, setPadBuffer] = useState<string>("");

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View>(null);
  const [activeSetSectionLayout, setActiveSetSectionLayout] = useState({
    y: 0,
    height: 0,
  });

  const handleActiveSetSectionLayout = useCallback((e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    setActiveSetSectionLayout({ y, height });
  }, []);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconMuted = isDark ? "#a3a3a3" : "#737373";
  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";

  const setNumRef = useRef(currentSet.set_number);
  useEffect(() => {
    if (setNumRef.current !== currentSet.set_number) {
      setNumRef.current = currentSet.set_number;
      setPadContext({ type: "active" });
      setPadOpen(false);
      setPadField("weight");
      setPadBuffer("");
    }
  }, [currentSet.set_number]);

  const onFocusPadField = useCallback(
    (field: PadField) => {
      if (padContext.type === "active") {
        const merged = padOpen
          ? applyBufferToSet(currentSet, padField, padBuffer)
          : currentSet;
        setCurrentSet(merged);
        setPadField(field);
        setPadBuffer(valueToBuffer(field, merged));
        setPadOpen(true);
      } else if (editingSet) {
        const merged = padOpen
          ? applyBufferToSet(editingSet, padField, padBuffer)
          : editingSet;
        setEditingSet(merged);
        setPadField(field);
        setPadBuffer(valueToBuffer(field, merged));
        setPadOpen(true);
      }
    },
    [padContext.type, currentSet, editingSet, padField, padBuffer, padOpen],
  );

  useLayoutEffect(() => {
    if (!padOpen) return;
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, activeSetSectionLayout.y - SCROLL_SECTION_TOP_INSET),
      animated: true,
    });
  }, [padOpen, activeSetSectionLayout.y, padField, editingSetIndex]);

  const handlePadDone = useCallback(() => {
    if (padContext.type === "active") {
      setCurrentSet((s) => applyBufferToSet(s, padField, padBuffer));
    } else if (editingSet) {
      setEditingSet((es) =>
        es ? applyBufferToSet(es, padField, padBuffer) : null,
      );
    }
    setPadOpen(false);
  }, [padContext.type, padField, padBuffer, editingSet]);

  const handlePadClear = useCallback(() => {
    setPadBuffer("");
    if (padContext.type === "active") {
      setCurrentSet((s) => applyBufferToSet(s, padField, ""));
    } else {
      setEditingSet((es) => (es ? applyBufferToSet(es, padField, "") : null));
    }
  }, [padContext.type, padField]);

  const handlePadDigit = useCallback(
    (digit: string) => {
      setPadBuffer((b) => appendPadKey(b, digit, padField));
    },
    [padField],
  );

  const handlePadBackspace = useCallback(() => {
    setPadBuffer((b) => appendPadKey(b, "backspace", padField));
  }, [padField]);

  const handleWeightNudge = useCallback(
    (delta: number) => {
      const base =
        parseWeightBuffer(padBuffer) ??
        (padContext.type === "edit" && editingSet
          ? editingSet.weight
          : currentSet.weight) ??
        0;
      const next = Math.max(0, Math.floor((base + delta) * 10) / 10);
      setPadBuffer(next === 0 ? "" : String(next));
    },
    [padBuffer, padContext.type, editingSet, currentSet.weight],
  );

  const handleAddSet = () => {
    const merged = padOpen
      ? applyBufferToSet(currentSet, padField, padBuffer)
      : currentSet;
    const isComplete = merged.is_unilateral
      ? merged.left_reps !== null &&
        merged.right_reps !== null &&
        merged.weight !== null &&
        merged.weight >= 0
      : merged.reps !== null &&
        merged.reps !== 0 &&
        merged.weight !== null &&
        merged.weight >= 0;

    if (!isComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Incomplete Set", "Please enter reps and weight");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newSet: ExerciseSet = { ...merged, partialReps: null };
    setSets((prev) => [...prev, newSet]);

    const nextNum = merged.set_number + 1;
    const copiedSet: ExerciseSet = {
      ...newSet,
      set_number: nextNum,
      partialReps: null,
    };

    setCurrentSet(copiedSet);
    setPadOpen(false);
    setPadField("weight");
    setPadBuffer(valueToBuffer("weight", copiedSet));
  };

  const handleComplete = () => {
    if (editingSetIndex !== null && editingSet !== null) {
      return;
    }

    const merged = padOpen
      ? applyBufferToSet(currentSet, padField, padBuffer)
      : currentSet;
    setCurrentSet(merged);
    setPadOpen(false);

    const finishWith = (finalSets: ExerciseSet[]) => {
      onComplete(finalSets);
    };

    if (hasPartialSetInput(merged) && !isSetCompleteForLog(merged)) {
      Alert.alert(
        "Unfinished set",
        "This set has values that aren't complete. They won't be saved unless you finish and tap Add set.",
        [
          { text: "Keep editing", style: "cancel" },
          {
            text: "Save anyway",
            style: "destructive",
            onPress: () => finishWith(sets),
          },
        ],
      );
      return;
    }

    if (isSetCompleteForLog(merged)) {
      Alert.alert(
        "Unlogged set",
        "You have a completed set that wasn't added to your history. Include it when saving?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save without it",
            style: "destructive",
            onPress: () => finishWith(sets),
          },
          {
            text: "Include & save",
            onPress: () => {
              const newSet: ExerciseSet = { ...merged, partialReps: null };
              finishWith([...sets, newSet]);
            },
          },
        ],
      );
      return;
    }

    finishWith(sets);
  };

  const startEditingSet = (set: ExerciseSet, originalIndex: number) => {
    if (padContext.type === "active" && padOpen) {
      setCurrentSet((s) => applyBufferToSet(s, padField, padBuffer));
    }
    setPadOpen(false);
    setEditingSetIndex(originalIndex);
    setEditingSet({ ...set, partialReps: null });
    setPadContext({ type: "edit", index: originalIndex });
    setPadField("weight");
    setPadBuffer(valueToBuffer("weight", set));
  };

  const saveEditedSet = () => {
    if (editingSetIndex === null || !editingSet) return;
    const merged = applyBufferToSet(editingSet, padField, padBuffer);
    const isComplete = merged.is_unilateral
      ? merged.left_reps !== null &&
        merged.right_reps !== null &&
        merged.weight !== null &&
        merged.weight >= 0
      : merged.reps !== null &&
        merged.reps !== 0 &&
        merged.weight !== null &&
        merged.weight >= 0;

    if (!isComplete) {
      Alert.alert("Incomplete Set", "Please enter all required values");
      return;
    }

    const newSets = [...sets];
    newSets[editingSetIndex] = { ...merged, partialReps: null };
    setSets(newSets);
    setEditingSetIndex(null);
    setEditingSet(null);
    setPadContext({ type: "active" });
    setPadOpen(false);
    setPadField("weight");
    setPadBuffer(valueToBuffer("weight", currentSet));
  };

  const cancelEditingSet = () => {
    setEditingSetIndex(null);
    setEditingSet(null);
    setPadContext({ type: "active" });
    setPadOpen(false);
    setPadField("weight");
    setPadBuffer(valueToBuffer("weight", currentSet));
  };

  const removeSet = (index: number) => {
    if (editingSetIndex !== null) {
      cancelEditingSet();
    }
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const formatExerciseName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const title = formatExerciseName(exercise.name);
  const categoryLabel =
    exercise.category || exercise.primaryMuscleGroup || "Exercise";

  const isEditingCompleted = editingSetIndex !== null && editingSet !== null;

  const padActive = padContext.type === "active" || padContext.type === "edit";

  const mergedForSaveCheck = padOpen
    ? applyBufferToSet(currentSet, padField, padBuffer)
    : currentSet;
  const canPressSave =
    !isEditingCompleted &&
    (sets.length > 0 ||
      hasPartialSetInput(mergedForSaveCheck) ||
      isSetCompleteForLog(mergedForSaveCheck));

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View
        className="border-b border-border dark:border-border-dark px-4 bg-background dark:bg-background-dark"
        style={{ paddingTop: insets.top + 8, paddingBottom: 10 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={26} color={primaryIcon} />
          </TouchableOpacity>
          <View className="flex-1 min-w-0 px-2 items-center justify-center">
            <AppText
              variant="subheader"
              tone="default"
              className="font-bold text-center"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </AppText>
          </View>
          <View className="w-10 h-10" />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: padOpen
            ? EXERCISE_PAD_EXTRA_PADDING + insets.bottom + 8
            : STICKY_SAVE_FOOTER_SCROLL_PADDING + insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View ref={scrollContentRef} collapsable={false}>
          <AppText
            variant="caption"
            tone="primary"
            className="normal-case mb-1 font-bold tracking-wide"
          >
            {categoryLabel}
          </AppText>
          <AppText
            variant="header"
            tone="default"
            className="font-bold mb-4 normal-case"
          >
            {title}
          </AppText>

          <ExerciseNotes
            notes={exercise.notes}
            workoutExerciseId={exercise.workoutExerciseId}
            onNotesUpdate={onNotesUpdate || (() => {})}
            exerciseName={title}
          />

          <View onLayout={handleActiveSetSectionLayout} collapsable={false}>
            {isEditingCompleted && editingSet ? (
              <SetInputForm
                key="edit-set"
                variant="edit"
                currentSet={editingSet}
                setCurrentSet={
                  setEditingSet as React.Dispatch<
                    React.SetStateAction<ExerciseSet>
                  >
                }
                lastSessionLabel={null}
                onSaveEdit={saveEditedSet}
                onCancelEdit={cancelEditingSet}
                padActive={padActive}
                padOpen={padOpen}
                activePadField={padField}
                padBuffer={padBuffer}
                onFocusPadField={onFocusPadField}
              />
            ) : (
              <SetInputForm
                key="log-set"
                variant="log"
                currentSet={currentSet}
                setCurrentSet={setCurrentSet}
                lastSessionLabel={lastSessionLineForSet(
                  lastSessionSets,
                  currentSet.set_number || 1,
                )}
                onAddSet={handleAddSet}
                padActive={padActive}
                padOpen={padOpen}
                activePadField={padField}
                padBuffer={padBuffer}
                onFocusPadField={onFocusPadField}
              />
            )}
          </View>

          <CompletedSetsList
            sets={sets}
            showAllSets={showAllSets}
            setShowAllSets={setShowAllSets}
            editingSetIndex={editingSetIndex}
            onStartEdit={startEditingSet}
            onRemoveSet={removeSet}
          />
        </View>
      </ScrollView>

      {!padOpen ? (
        <View
          className="bg-background dark:bg-background-dark px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!canPressSave}
            className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              !canPressSave
                ? "bg-surfaceAlt dark:bg-surfaceAlt-dark"
                : "bg-primary dark:bg-primary-dark active:opacity-90"
            }`}
            accessibilityLabel="Save"
            accessibilityHint={
              isEditingCompleted
                ? "Save or cancel editing the set first"
                : undefined
            }
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={!canPressSave ? iconMuted : "#ffffff"}
            />
            <AppText
              variant="body"
              tone={!canPressSave ? "muted" : "inverse"}
              className="font-bold uppercase tracking-wider text-xs"
            >
              Save
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}

      {padOpen ? (
        <View className="absolute bottom-0 left-0 right-0">
          <ExerciseNumericPad
            activeField={padField}
            onClear={handlePadClear}
            onDone={handlePadDone}
            onDigit={handlePadDigit}
            onBackspace={handlePadBackspace}
            onWeightNudge={handleWeightNudge}
          />
        </View>
      ) : null}
    </View>
  );
};

export default ExerciseTracker;
