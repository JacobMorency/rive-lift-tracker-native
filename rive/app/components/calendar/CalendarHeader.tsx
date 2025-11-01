import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CalendarTheme } from "./types";
import { MONTHS } from "./types";

type CalendarHeaderProps = {
  currentMonth: Date;
  theme: CalendarTheme;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export default function CalendarHeader({
  currentMonth,
  theme,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  const monthName = MONTHS[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <TouchableOpacity
        onPress={onPreviousMonth}
        style={{
          padding: 8,
          borderRadius: 8,
        }}
      >
        <Ionicons name="chevron-back" size={24} color={theme.arrowColor} />
      </TouchableOpacity>

      <Text
        style={{
          fontSize: theme.textMonthFontSize,
          fontWeight: theme.textMonthFontWeight,
          color: theme.monthTextColor,
        }}
      >
        {monthName} {year}
      </Text>

      <TouchableOpacity
        onPress={onNextMonth}
        style={{
          padding: 8,
          borderRadius: 8,
        }}
      >
        <Ionicons name="chevron-forward" size={24} color={theme.arrowColor} />
      </TouchableOpacity>
    </View>
  );
}

