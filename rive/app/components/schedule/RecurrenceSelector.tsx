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
      <Text className="text-base-content font-medium mb-2">Repeat</Text>
      <TouchableOpacity
        className="bg-base-200 rounded-lg p-3 flex-row items-center justify-between"
        onPress={onToggleDropdown}
      >
        <Text className="text-base-content">
          {getRecurrenceDisplayText(recurrenceType, startDate)}
        </Text>
        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>

      {showDropdown && (
        <View className="mt-2 bg-base-100 rounded-lg border border-base-300">
          {getRecurrenceOptions(startDate).map((option) => (
            <TouchableOpacity
              key={option.type}
              className={`p-3 border-b border-base-300 last:border-b-0 ${
                recurrenceType === option.type
                  ? "bg-primary/10"
                  : "bg-transparent"
              }`}
              onPress={() => onSelectRecurrence(option.type)}
            >
              <Text
                className={`font-medium ${
                  recurrenceType === option.type
                    ? "text-primary"
                    : "text-base-content"
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

