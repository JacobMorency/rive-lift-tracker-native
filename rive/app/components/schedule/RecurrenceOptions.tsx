import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RecurrenceType } from "../../lib/scheduleUtils";

type RecurrenceOptionsProps = {
  recurrenceType: RecurrenceType;
  selectedDays: number[];
  selectedDates: number[];
  onDayToggle: (day: number) => void;
  onDateToggle: (date: number) => void;
};

export default function RecurrenceOptions({
  recurrenceType,
  selectedDays,
  selectedDates,
  onDayToggle,
  onDateToggle,
}: RecurrenceOptionsProps) {
  if (recurrenceType === "monthly_date") {
    return (
      <View className="mb-4">
        <Text className="text-zinc-900 dark:text-white font-medium mb-2">
          Dates of Month
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
            <TouchableOpacity
              key={date}
              className={`w-10 h-10 rounded-lg border items-center justify-center ${
                selectedDates.includes(date)
                  ? "bg-[#ff4b8c] dark:bg-[#ff6fa1] border-[#ff4b8c] dark:border-[#ff6fa1]"
                  : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
              }`}
              onPress={() => onDateToggle(date)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedDates.includes(date)
                    ? "text-white"
                    : "text-zinc-900 dark:text-white"
                }`}
              >
                {date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return null;
}

