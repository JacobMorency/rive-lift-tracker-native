import React from "react";
import { View, Text, Dimensions } from "react-native";
import { DAYS_OF_WEEK } from "./types";
import { CalendarTheme, CalendarMarker } from "./types";
import CalendarDay from "./CalendarDay";

const { width } = Dimensions.get("window");
const CALENDAR_WIDTH = width - 32;
const DAY_WIDTH = CALENDAR_WIDTH / 7;

type CalendarGridProps = {
  days: (number | null)[];
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

export default function CalendarGrid({
  days,
  currentMonth,
  selectedDate,
  markedDates = {},
  theme,
  onDatePress,
  formatDate,
  isToday,
  isSelected,
  isPastDate,
}: CalendarGridProps) {
  return (
    <>
      {/* Days of Week Header */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 8,
        }}
      >
        {DAYS_OF_WEEK.map((day) => (
          <View
            key={day}
            style={{
              width: DAY_WIDTH,
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontSize: theme.textDayHeaderFontSize,
                fontWeight: theme.textDayHeaderFontWeight,
                color: theme.textSectionTitleColor,
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View>
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
          <View
            key={weekIndex}
            style={{
              flexDirection: "row",
              marginBottom: 4,
            }}
          >
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const globalIndex = weekIndex * 7 + dayIndex;
              const day = days[globalIndex];

              return (
                <CalendarDay
                  key={`day-${day}-${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
                  day={day}
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  markedDates={markedDates}
                  theme={theme}
                  onDatePress={onDatePress}
                  formatDate={formatDate}
                  isToday={isToday}
                  isSelected={isSelected}
                  isPastDate={isPastDate}
                />
              );
            })}
          </View>
        ))}
      </View>
    </>
  );
}

