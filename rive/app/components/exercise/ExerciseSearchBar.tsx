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
  return (
    <View className="px-4 pt-8 bg-background dark:bg-background-dark">
      <View className="flex-row items-center bg-surfaceAlt dark:bg-surfaceAlt-dark rounded-full px-4 py-4">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-text dark:text-text-dark"
          placeholder="Search exercises..."
          placeholderTextColor="#9ca3af"
          value={searchValue}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searchValue.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")} className="ml-2">
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
