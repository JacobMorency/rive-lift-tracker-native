import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { CalendarMarker, CalendarTheme } from "./types";
import ScheduledWorkoutIndicator from "./ScheduledWorkoutIndicator";

const { width } = Dimensions.get("window");
const CALENDAR_WIDTH = width - 32;
const DAY_WIDTH = CALENDAR_WIDTH / 7;

type CalendarDayProps = {
  day: number | null;
  currentMonth: Date;
  selectedDate: string;
  markedDates?: Record<string, CalendarMarker>;
  theme: CalendarTheme;
  onDatePress: (day: number) => void;
  formatDate: (date: Date) => string;
  isToday: (day: number) => boolean;
  isSelected: (day: number) => boolean;
  isPastDate: (day: number) => boolean;
};

export default function CalendarDay({
  day,
  currentMonth,
  selectedDate,
  markedDates = {},
  theme,
  onDatePress,
  formatDate,
  isToday,
  isSelected,
  isPastDate,
}: CalendarDayProps) {
  if (day === null || day === undefined) {
    return (
      <View
        style={{
          width: DAY_WIDTH,
          height: DAY_WIDTH,
        }}
      />
    );
  }

  const dateString = formatDate(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
  );
  const marked = markedDates[dateString];
  const isSelectedDay = isSelected(day);
  const isTodayDay = isToday(day);
  const isPast = isPastDate(day);

  return (
    <TouchableOpacity
      onPress={() => onDatePress(day)}
      style={{
        width: DAY_WIDTH,
        height: DAY_WIDTH,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: isSelectedDay
          ? theme.selectedDayBackgroundColor
          : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: theme.textDayFontSize,
          fontWeight: theme.textDayFontWeight,
          color: isSelectedDay
            ? theme.selectedDayTextColor
            : isTodayDay
              ? theme.todayTextColor
              : isPast
                ? theme.textDisabledColor
                : theme.dayTextColor,
        }}
      >
        {day}
      </Text>

      {marked && (
        <ScheduledWorkoutIndicator
          marker={marked}
          isSelected={isSelectedDay}
          theme={theme}
        />
      )}
    </TouchableOpacity>
  );
}

