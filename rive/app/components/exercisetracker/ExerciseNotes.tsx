import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedNotes, setEditedNotes] = useState<string>(notes || "");
  const insets = useSafeAreaInsets();

  // Sync editedNotes when notes prop changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedNotes(notes || "");
    }
  }, [notes, isEditing]);

  // Don't render if no workoutExerciseId (can't save without it)
  if (!workoutExerciseId) {
    return null;
  }

  const handleSave = () => {
    onNotesUpdate(editedNotes.trim());
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setEditedNotes(notes || "");
    setIsEditing(false);
    if (!notes || notes.trim().length === 0) {
      setIsModalOpen(false);
    }
  };

  const handleEdit = () => {
    setEditedNotes(notes || "");
    setIsEditing(true);
  };

  const handleOpenModal = () => {
    // If no notes, automatically enter edit mode
    const shouldEdit = !hasNotes;
    setIsEditing(shouldEdit);
    setEditedNotes(notes || "");
    setIsModalOpen(true);
  };

  const hasNotes = notes ? notes.trim().length > 0 : false;

  return (
    <>
      <View
        className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-4 mb-4 flex-row items-center gap-2"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={handleOpenModal}
          className="flex-row items-center gap-2 flex-1"
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={16} color="#ff4b8c" />
          <Text className="text-sm font-medium text-zinc-900 dark:text-white">Notes:</Text>
          {hasNotes ? (
            <Text className="text-sm text-gray-500 dark:text-gray-400 flex-1" numberOfLines={1}>
              {notes}
            </Text>
          ) : (
            <Text className="text-sm text-gray-500 dark:text-gray-400">Tap to add</Text>
          )}
        </TouchableOpacity>
        {hasNotes && (
          <TouchableOpacity
            onPress={handleOpenModal}
            className="p-1"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-white dark:bg-zinc-900" style={{ paddingTop: insets.top }}>
          {/* Header */}
          <View className="px-4 py-4 border-b border-gray-200 dark:border-zinc-700">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Exercise Notes
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {exerciseName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            {isEditing ? (
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-zinc-900 dark:text-white mb-2">
                    Notes
                  </Text>
                  <TextInput
                    className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-white"
                    placeholder={`Add notes for ${exerciseName}...`}
                    placeholderTextColor="#9ca3af"
                    value={editedNotes}
                    onChangeText={setEditedNotes}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                    style={{
                      minHeight: 200,
                      fontSize: 16,
                      lineHeight: 24,
                    }}
                    autoFocus={true}
                  />
                </View>
                <View className="flex-row items-center justify-end gap-3 pt-2">
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="px-5 py-3 rounded-xl"
                  >
                    <Text className="text-base font-medium text-zinc-900 dark:text-white">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    className="px-5 py-3 rounded-xl bg-[#ff4b8c] dark:bg-[#ff6fa1]"
                    style={{
                      shadowColor: "#ff4b8c",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Text className="text-base font-semibold text-white">
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="gap-4">
                {hasNotes ? (
                  <>
                    <View className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                      <Text
                        className="text-base text-zinc-900 dark:text-white leading-6"
                        style={{ fontSize: 16, lineHeight: 24 }}
                      >
                        {notes}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleEdit}
                      className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-[#ff4b8c] dark:bg-[#ff6fa1]"
                      style={{
                        shadowColor: "#ff4b8c",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <Ionicons name="pencil" size={18} color="#ffffff" />
                      <Text className="text-base font-semibold text-white">
                        Edit Notes
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View className="items-center py-8">
                    <View className="w-16 h-16 bg-[#ff4b8c] dark:bg-[#ff6fa1]/10 rounded-full items-center justify-center mb-4">
                      <Ionicons
                        name="document-text-outline"
                        size={32}
                        color="#ff4b8c"
                      />
                    </View>
                    <Text className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                      No Notes Yet
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
                      Add notes to remember setup details, form cues, or other
                      reminders for this exercise.
                    </Text>
                    <TouchableOpacity
                      onPress={handleEdit}
                      className="flex-row items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#ff4b8c] dark:bg-[#ff6fa1]"
                      style={{
                        shadowColor: "#ff4b8c",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <Ionicons name="add-circle" size={20} color="#ffffff" />
                      <Text className="text-base font-semibold text-white">
                        Add Notes
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
