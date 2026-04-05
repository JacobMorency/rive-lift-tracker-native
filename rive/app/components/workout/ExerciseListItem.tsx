import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, TouchableOpacity, TextInput, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "./types";
import AppText from "../ui/AppText";

type ExerciseListItemProps = {
  exercise: Exercise;
  index: number;
  onRemove: (exerciseId: number, exerciseName: string) => void;
  onNotesUpdate: (workoutExerciseId: string, notes: string) => void;
};

const NOTES_INPUT_MIN_HEIGHT = 56;
const NOTES_INPUT_MAX_HEIGHT = 240;

const formatExerciseName = (name: string) => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ExerciseListItem({
  exercise,
  index: _index,
  onRemove,
  onNotesUpdate,
}: ExerciseListItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primaryIcon = isDark ? "#ff6fa1" : "#ff4b8c";

  const [editedNotes, setEditedNotes] = useState<string>(exercise.notes || "");
  const [notesExpanded, setNotesExpanded] = useState(
    () => !!(exercise.notes || "").trim(),
  );
  const [notesInputHeight, setNotesInputHeight] = useState(
    NOTES_INPUT_MIN_HEIGHT,
  );
  const lastSavedRef = useRef((exercise.notes || "").trim());
  const notesInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setEditedNotes(exercise.notes || "");
    lastSavedRef.current = (exercise.notes || "").trim();
    if ((exercise.notes || "").trim().length > 0) {
      setNotesExpanded(true);
    } else {
      setNotesExpanded(false);
      setNotesInputHeight(NOTES_INPUT_MIN_HEIGHT);
    }
  }, [exercise.notes, exercise.workoutExerciseId]);

  const handleNotesBlur = useCallback(() => {
    if (!exercise.workoutExerciseId) return;
    const next = editedNotes.trim();
    if (next !== lastSavedRef.current) {
      lastSavedRef.current = next;
      onNotesUpdate(exercise.workoutExerciseId, editedNotes);
    }
    if (next === "") {
      setNotesExpanded(false);
      setNotesInputHeight(NOTES_INPUT_MIN_HEIGHT);
    }
  }, [editedNotes, exercise.workoutExerciseId, onNotesUpdate]);

  const expandNotes = () => {
    setNotesExpanded(true);
    requestAnimationFrame(() => {
      notesInputRef.current?.focus();
    });
  };

  const showCollapsedRow =
    !notesExpanded && editedNotes.trim() === "";

  return (
    <View className="rounded-3xl border border-primary/10 bg-surfaceAlt p-5 dark:border-primary-dark/20 dark:bg-surfaceAlt-dark">
      <View className="mb-4 flex-row items-start justify-between">
        <View className="min-w-0 flex-1 pr-3">
          {exercise.primaryMuscleGroup ? (
            <AppText
              variant="caption"
              tone="primary"
              className="mb-1 font-bold"
              style={{ letterSpacing: 1 }}
            >
              {exercise.primaryMuscleGroup}
            </AppText>
          ) : null}
          <AppText variant="subheader" tone="default" className="normal-case">
            {formatExerciseName(exercise.name)}
          </AppText>
        </View>
        <TouchableOpacity
          className="p-1"
          onPress={() => onRemove(exercise.id, exercise.name)}
          accessibilityRole="button"
          accessibilityLabel="Remove exercise"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View className="mt-1">
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons
            name="document-text-outline"
            size={16}
            color={primaryIcon}
          />
          <AppText variant="caption" tone="muted" className="normal-case">
            Notes
          </AppText>
        </View>
        {showCollapsedRow ? (
          <TouchableOpacity
            onPress={expandNotes}
            className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-3 py-3.5 dark:border-border-dark dark:bg-surface-dark"
            accessibilityRole="button"
            accessibilityLabel={`Add notes for ${formatExerciseName(exercise.name)}`}
            activeOpacity={0.85}
          >
            <AppText variant="body" tone="muted" className="normal-case">
              Add notes
            </AppText>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ) : (
          <TextInput
            ref={notesInputRef}
            className="rounded-xl border border-border bg-surface px-3 py-3 text-ds-body text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
            placeholder={`Notes for ${formatExerciseName(exercise.name)}…`}
            placeholderTextColor="#9ca3af"
            value={editedNotes}
            onChangeText={setEditedNotes}
            onBlur={handleNotesBlur}
            multiline
            scrollEnabled={notesInputHeight >= NOTES_INPUT_MAX_HEIGHT - 4}
            textAlignVertical="top"
            style={{
              minHeight: NOTES_INPUT_MIN_HEIGHT,
              maxHeight: NOTES_INPUT_MAX_HEIGHT,
              height: notesInputHeight,
            }}
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height;
              const padded = Math.ceil(h + 24);
              setNotesInputHeight(
                Math.min(
                  NOTES_INPUT_MAX_HEIGHT,
                  Math.max(NOTES_INPUT_MIN_HEIGHT, padded),
                ),
              );
            }}
            accessibilityLabel={`Notes for ${formatExerciseName(exercise.name)}`}
          />
        )}
      </View>
    </View>
  );
}
