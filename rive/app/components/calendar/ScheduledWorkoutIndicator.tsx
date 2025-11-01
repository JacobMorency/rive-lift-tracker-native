import React from "react";
import { View, Text } from "react-native";
import { CalendarMarker, CalendarTheme } from "./types";

type ScheduledWorkoutIndicatorProps = {
  marker: CalendarMarker;
  isSelected: boolean;
  theme: CalendarTheme;
};

export default function ScheduledWorkoutIndicator({
  marker,
  isSelected,
  theme,
}: ScheduledWorkoutIndicatorProps) {
  if (!marker.dots || marker.dots.length === 0) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 2,
      }}
    >
      {marker.dots.slice(0, 3).map((dot, dotIndex) => (
        <View
          key={dotIndex}
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: isSelected
              ? dot.selectedDotColor || theme.selectedDotColor
              : dot.color || theme.dotColor,
            marginHorizontal: 1,
          }}
        />
      ))}
      {marker.dots.length > 3 && (
        <Text
          style={{
            fontSize: 8,
            color: isSelected
              ? theme.selectedDayTextColor
              : theme.dayTextColor,
            marginLeft: 2,
          }}
        >
          +{marker.dots.length - 3}
        </Text>
      )}
    </View>
  );
}

