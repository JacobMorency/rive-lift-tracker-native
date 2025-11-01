import React from "react";
import { View } from "react-native";
import {
  CalendarMarker,
  CalendarTheme,
} from "./calendar/types";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarGrid from "./calendar/CalendarGrid";

type CustomCalendarProps = {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
  markedDates?: Record<string, CalendarMarker>;
  theme?: CalendarTheme;
};

export default function CustomCalendar({
  selectedDate,
  onDateSelect,
  onMonthChange,
  markedDates = {},
  theme = {},
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Notify parent when month changes
  React.useEffect(() => {
    if (onMonthChange) {
      onMonthChange(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    }
  }, [currentMonth, onMonthChange]);

  // Default theme
  const defaultTheme = {
    backgroundColor: "#1a1a1a",
    calendarBackground: "#1a1a1a",
    textSectionTitleColor: "#ffffff",
    selectedDayBackgroundColor: "#ff4b8c",
    selectedDayTextColor: "#ffffff",
    todayTextColor: "#ff4b8c",
    dayTextColor: "#ffffff",
    textDisabledColor: "#6b7280",
    dotColor: "#ff4b8c",
    selectedDotColor: "#ff4b8c",
    arrowColor: "#ff4b8c",
    monthTextColor: "#ffffff",
    textDayFontWeight: "500",
    textMonthFontWeight: "bold",
    textDayHeaderFontWeight: "600",
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
    ...theme,
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return formatDate(currentDate) === formatDate(today);
  };

  const isSelected = (day: number) => {
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return formatDate(currentDate) === selectedDate;
  };

  const isPastDate = (day: number) => {
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return currentDate < today;
  };

  const handleDatePress = (day: number) => {
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateSelect(formatDate(currentDate));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View
      style={{
        backgroundColor: defaultTheme.calendarBackground,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <CalendarHeader
        currentMonth={currentMonth}
        theme={defaultTheme}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <CalendarGrid
        days={days}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        markedDates={markedDates}
        theme={defaultTheme}
        onDatePress={handleDatePress}
        formatDate={formatDate}
        isToday={isToday}
        isSelected={isSelected}
        isPastDate={isPastDate}
      />
    </View>
  );
}
