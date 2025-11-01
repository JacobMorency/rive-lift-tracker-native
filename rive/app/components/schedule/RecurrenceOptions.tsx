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
        <Text className="text-base-content font-medium mb-2">
          Dates of Month
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
            <TouchableOpacity
              key={date}
              className={`w-10 h-10 rounded-lg border items-center justify-center ${
                selectedDates.includes(date)
                  ? "bg-primary border-primary"
                  : "bg-base-200 border-base-300"
              }`}
              onPress={() => onDateToggle(date)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedDates.includes(date)
                    ? "text-primary-content"
                    : "text-base-content"
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

