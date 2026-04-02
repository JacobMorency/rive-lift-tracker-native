import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../ui/AppText";

const PLACEHOLDER =
  "e.g. Bench at 30°, seat height 5, grip just outside rings";

type ExerciseNotesProps = {
  notes: string | null | undefined;
  workoutExerciseId: string | undefined;
  onNotesUpdate: (notes: string) => void;
  exerciseName: string;
};

export default function ExerciseNotes({
  notes,
  workoutExerciseId,
  onNotesUpdate,
  exerciseName,
}: ExerciseNotesProps) {
  const [editedNotes, setEditedNotes] = useState<string>(notes || "");
  const [expanded, setExpanded] = useState(false);
  const focusedRef = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const mutedIcon = isDark ? "#a1a1aa" : "#6b7280";
  const chevronColor = isDark ? "#f5f5f5" : "#111113";

  const hasNotes = (editedNotes || "").trim().length > 0;

  useEffect(() => {
    if (!focusedRef.current) {
      setEditedNotes(notes || "");
    }
  }, [notes]);

  if (!workoutExerciseId) {
    return null;
  }

  const persistIfChanged = () => {
    const next = editedNotes.trim();
    const prev = (notes || "").trim();
    if (next !== prev) {
      onNotesUpdate(next);
    }
  };

  const toggleExpanded = () => {
    if (expanded) {
      inputRef.current?.blur();
      persistIfChanged();
    }
    setExpanded((e) => !e);
  };

  return (
    <View className="mb-3 border-b border-border dark:border-border-dark pb-3">
      <TouchableOpacity
        onPress={toggleExpanded}
        className="flex-row items-center justify-between gap-2 py-1"
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? "Collapse exercise note" : "Expand exercise note"
        }
        accessibilityState={{ expanded }}
      >
        <View className="flex-1 min-w-0">
          <AppText
            variant="caption"
            tone="muted"
            className="normal-case tracking-normal"
          >
            Note
          </AppText>
          {!expanded ? (
            <AppText
              variant="body"
              tone={hasNotes ? "default" : "muted"}
              numberOfLines={1}
              className="text-sm leading-5 mt-0.5"
            >
              {hasNotes ? editedNotes : PLACEHOLDER}
            </AppText>
          ) : null}
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={chevronColor}
        />
      </TouchableOpacity>

      {expanded ? (
        <TextInput
          ref={inputRef}
          className="bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-ds-control border border-border dark:border-border-dark px-3 py-2.5 text-text dark:text-text-dark text-sm leading-5 min-h-[72px] mt-2"
          placeholder={PLACEHOLDER}
          placeholderTextColor={mutedIcon}
          value={editedNotes}
          onChangeText={setEditedNotes}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={() => {
            focusedRef.current = false;
            persistIfChanged();
          }}
          multiline
          textAlignVertical="top"
          accessibilityLabel={`Exercise note for ${exerciseName}`}
          scrollEnabled
        />
      ) : null}
    </View>
  );
}
