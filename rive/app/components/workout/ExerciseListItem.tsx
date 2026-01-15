import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Exercise } from "./types";

type ExerciseListItemProps = {
  exercise: Exercise;
  index: number;
  onRemove: (exerciseId: number, exerciseName: string) => void;
  onNotesUpdate: (workoutExerciseId: string, notes: string) => void;
};

const formatExerciseName = (name: string) => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ExerciseListItem({
  exercise,
  index,
  onRemove,
  onNotesUpdate,
}: ExerciseListItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState<string>(exercise.notes || "");
  const insets = useSafeAreaInsets();

  // Sync editedNotes when exercise notes change (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedNotes(exercise.notes || "");
    }
  }, [exercise.notes, isEditing]);

  const hasNotes = exercise.notes && exercise.notes.trim().length > 0;

  const handleSave = () => {
    if (exercise.workoutExerciseId) {
      onNotesUpdate(exercise.workoutExerciseId, editedNotes.trim());
    }
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setEditedNotes(exercise.notes || "");
    setIsEditing(false);
    if (!hasNotes) {
      setIsModalOpen(false);
    }
  };

  const handleEdit = () => {
    setEditedNotes(exercise.notes || "");
    setIsEditing(true);
  };

  return (
    <>
      <View
        className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center gap-4">
          <View className="w-10 h-10 bg-[#ff4b8c]/20 dark:bg-[#ff6fa1]/20 rounded-xl items-center justify-center">
            <Ionicons name="barbell-outline" size={20} color="#ff4b8c" />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
              {formatExerciseName(exercise.name)}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              {exercise.primaryMuscleGroup && (
                <View className="bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded-full">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{exercise.primaryMuscleGroup}</Text>
                </View>
              )}
            </View>
            {hasNotes && (
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="flex-row items-center gap-2 mt-2"
                activeOpacity={0.7}
              >
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color="#ff4b8c"
                />
                <Text className="text-xs text-gray-500 dark:text-gray-400 flex-1" numberOfLines={1}>
                  {exercise.notes}
                </Text>
              </TouchableOpacity>
            )}
            {!hasNotes && (
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="flex-row items-center gap-1 mt-2"
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={14} color="#6b7280" />
                <Text className="text-xs text-gray-500 dark:text-gray-400">Add notes</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="w-10 h-10 bg-error/20 rounded-xl items-center justify-center"
            onPress={() => onRemove(exercise.id, exercise.name)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-white dark:bg-zinc-900" style={{ paddingTop: insets.top }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
            <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
              Notes - {formatExerciseName(exercise.name)}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {isEditing ? (
              <View className="gap-4">
                <TextInput
                  className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white"
                  placeholder={`Add notes for ${formatExerciseName(exercise.name)}...`}
                  placeholderTextColor="#9ca3af"
                  value={editedNotes}
                  onChangeText={setEditedNotes}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  style={{
                    minHeight: 150,
                  }}
                />
                <View className="flex-row items-center justify-end gap-2">
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800"
                  >
                    <Text className="text-sm font-medium text-zinc-900 dark:text-white">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    className="px-4 py-2 rounded-lg bg-primary"
                  >
                    <Text className="text-sm font-medium text-white">
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="gap-4">
                {hasNotes ? (
                  <>
                    <Text className="text-base text-zinc-900 dark:text-white leading-6">
                      {exercise.notes}
                    </Text>
                    <TouchableOpacity
                      onPress={handleEdit}
                      className="flex-row items-center gap-2 py-3 rounded-lg bg-gray-50 dark:bg-zinc-800"
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={16}
                        color="#ff4b8c"
                      />
                      <Text className="text-primary font-medium">Edit</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No notes yet. Add notes to remember setup details, form
                      cues, or other reminders for this exercise.
                    </Text>
                    <TouchableOpacity
                      onPress={handleEdit}
                      className="flex-row items-center justify-center gap-2 py-3 rounded-lg bg-primary"
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color="#ffffff"
                      />
                      <Text className="text-white font-medium">
                        Add Notes
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
