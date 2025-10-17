import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CALENDAR_WIDTH = width - 32; // Account for padding
const DAY_WIDTH = CALENDAR_WIDTH / 7;

type CalendarMarker = {
  date: string;
  dots: Array<{
    color: string;
    selectedDotColor?: string;
  }>;
};

type CustomCalendarProps = {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  markedDates?: Record<string, CalendarMarker>;
  theme?: {
    backgroundColor?: string;
    calendarBackground?: string;
    textSectionTitleColor?: string;
    selectedDayBackgroundColor?: string;
    selectedDayTextColor?: string;
    todayTextColor?: string;
    dayTextColor?: string;
    textDisabledColor?: string;
    dotColor?: string;
    selectedDotColor?: string;
    arrowColor?: string;
    monthTextColor?: string;
    textDayFontWeight?: string;
    textMonthFontWeight?: string;
    textDayHeaderFontWeight?: string;
    textDayFontSize?: number;
    textMonthFontSize?: number;
    textDayHeaderFontSize?: number;
  };
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CustomCalendar({
  selectedDate,
  onDateSelect,
  markedDates = {},
  theme = {},
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

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
  const monthName = MONTHS[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

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
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={{
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={defaultTheme.arrowColor}
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: defaultTheme.textMonthFontSize,
            fontWeight: defaultTheme.textMonthFontWeight,
            color: defaultTheme.monthTextColor,
          }}
        >
          {monthName} {year}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={{
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={defaultTheme.arrowColor}
          />
        </TouchableOpacity>
      </View>

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
                fontSize: defaultTheme.textDayHeaderFontSize,
                fontWeight: defaultTheme.textDayHeaderFontWeight,
                color: defaultTheme.textSectionTitleColor,
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {days.map((day, index) => {
          if (day === null) {
            return (
              <View
                key={`empty-${index}`}
                style={{
                  width: DAY_WIDTH,
                  height: DAY_WIDTH,
                  marginBottom: 4,
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
              key={`day-${day}-${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
              onPress={() => handleDatePress(day)}
              style={{
                width: DAY_WIDTH,
                height: DAY_WIDTH,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
                borderRadius: 8,
                backgroundColor: isSelectedDay
                  ? defaultTheme.selectedDayBackgroundColor
                  : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: defaultTheme.textDayFontSize,
                  fontWeight: defaultTheme.textDayFontWeight,
                  color: isSelectedDay
                    ? defaultTheme.selectedDayTextColor
                    : isTodayDay
                      ? defaultTheme.todayTextColor
                      : isPast
                        ? defaultTheme.textDisabledColor
                        : defaultTheme.dayTextColor,
                }}
              >
                {day}
              </Text>

              {/* Workout Dots */}
              {marked && marked.dots && marked.dots.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  {marked.dots.slice(0, 3).map((dot, dotIndex) => (
                    <View
                      key={dotIndex}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: isSelectedDay
                          ? dot.selectedDotColor ||
                            defaultTheme.selectedDotColor
                          : dot.color || defaultTheme.dotColor,
                        marginHorizontal: 1,
                      }}
                    />
                  ))}
                  {marked.dots.length > 3 && (
                    <Text
                      style={{
                        fontSize: 8,
                        color: isSelectedDay
                          ? defaultTheme.selectedDayTextColor
                          : defaultTheme.dayTextColor,
                        marginLeft: 2,
                      }}
                    >
                      +{marked.dots.length - 3}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
