import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecurrenceType } from "../../lib/scheduleUtils";
import {
  getRecurrenceOptions,
  getRecurrenceDisplayText,
} from "./types";

type RecurrenceSelectorProps = {
  recurrenceType: RecurrenceType;
  startDate: string;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectRecurrence: (type: RecurrenceType) => void;
};

export default function RecurrenceSelector({
  recurrenceType,
  startDate,
  showDropdown,
  onToggleDropdown,
  onSelectRecurrence,
}: RecurrenceSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="text-zinc-900 dark:text-white font-medium mb-2">Repeat</Text>
      <TouchableOpacity
        className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 flex-row items-center justify-between"
        onPress={onToggleDropdown}
      >
        <Text className="text-zinc-900 dark:text-white">
          {getRecurrenceDisplayText(recurrenceType, startDate)}
        </Text>
        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>

      {showDropdown && (
        <View className="mt-2 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
          {getRecurrenceOptions(startDate).map((option) => (
            <TouchableOpacity
              key={option.type}
              className={`p-3 border-b border-gray-200 dark:border-zinc-700 last:border-b-0 ${
                recurrenceType === option.type
                  ? "bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10"
                  : "bg-transparent"
              }`}
              onPress={() => onSelectRecurrence(option.type)}
            >
              <Text
                className={`font-medium ${
                  recurrenceType === option.type
                    ? "text-[#ff4b8c] dark:text-[#ff6fa1]"
                    : "text-zinc-900 dark:text-white"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

