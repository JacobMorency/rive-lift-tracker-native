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
    <View className="mb-4 rounded-2xl border border-border dark:border-border-dark bg-surfaceAlt dark:bg-surfaceAlt-dark p-4">
      <TouchableOpacity
        onPress={toggleExpanded}
        className="flex-row items-center justify-between gap-2"
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? "Collapse exercise note" : "Expand exercise note"
        }
        accessibilityState={{ expanded }}
      >
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <Ionicons name="document-text-outline" size={22} color={mutedIcon} />
          <View className="flex-1 min-w-0">
            <AppText
              variant="caption"
              tone="muted"
              className="font-bold tracking-widest normal-case"
            >
              Note
            </AppText>
            {!expanded ? (
              <AppText
                variant="body"
                tone={hasNotes ? "default" : "muted"}
                numberOfLines={1}
                className="text-xs font-semibold mt-0.5 normal-case"
              >
                {hasNotes ? editedNotes : PLACEHOLDER}
              </AppText>
            ) : null}
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={20}
          color={chevronColor}
        />
      </TouchableOpacity>

      {expanded ? (
        <TextInput
          ref={inputRef}
          className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark px-3 py-2.5 text-text dark:text-text-dark text-sm leading-5 min-h-[72px] mt-3"
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
