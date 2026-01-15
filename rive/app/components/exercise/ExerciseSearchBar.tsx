import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ExerciseSearchBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export default function ExerciseSearchBar({
  searchValue,
  onSearchChange,
}: ExerciseSearchBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-6 pt-4 bg-white dark:bg-zinc-900"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View
        className="flex-row items-center bg-gray-50 dark:bg-zinc-800 rounded-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-zinc-900 dark:text-white bg-transparent text-base"
          placeholder="Search exercises..."
          placeholderTextColor="#9ca3af"
          value={searchValue}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searchValue.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange("")}
            className="ml-2"
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

