import React from "react";
import { View, TouchableOpacity } from "react-native";
import { RecurrenceType } from "../../lib/scheduleUtils";
import AppText from "../ui/AppText";

type RecurrenceOptionsProps = {
  recurrenceType: RecurrenceType;
  selectedDays: number[];
  selectedDates: number[];
  onDayToggle: (day: number) => void;
  onDateToggle: (date: number) => void;
};

export default function RecurrenceOptions({
  recurrenceType,
  selectedDays: _selectedDays,
  selectedDates,
  onDayToggle: _onDayToggle,
  onDateToggle,
}: RecurrenceOptionsProps) {
  if (recurrenceType === "monthly_date") {
    return (
      <View className="mb-6">
        <AppText variant="caption" tone="muted" className="mb-3 normal-case">
          Dates of month
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
            const selected = selectedDates.includes(date);
            return (
              <TouchableOpacity
                key={date}
                className={`h-10 w-10 items-center justify-center rounded-ds-control border ${
                  selected
                    ? "border-primary/40 bg-primary dark:border-primary-dark/50 dark:bg-primary-dark"
                    : "border-border bg-surfaceAlt dark:border-border-dark dark:bg-surfaceAlt-dark"
                }`}
                onPress={() => onDateToggle(date)}
                activeOpacity={0.85}
              >
                <AppText
                  variant="body"
                  tone={selected ? "inverse" : "default"}
                  className="text-sm font-semibold"
                >
                  {date}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return null;
}
