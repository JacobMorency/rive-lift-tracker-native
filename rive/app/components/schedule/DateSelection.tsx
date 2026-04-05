import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppText from "../ui/AppText";

type DateSelectionProps = {
  startDate: string;
  endDate: string;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  recurrenceType: string;
  onStartDatePress: () => void;
  onEndDatePress: () => void;
  onStartDateChange: (event: any, selectedDate?: Date) => void;
  onEndDateChange: (event: any, selectedDate?: Date) => void;
};

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function DateSelection({
  startDate,
  endDate,
  showStartDatePicker,
  showEndDatePicker,
  recurrenceType,
  onStartDatePress,
  onEndDatePress,
  onStartDateChange,
  onEndDateChange,
}: DateSelectionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <AppText variant="caption" tone="muted" className="mb-2 normal-case">
            Start date
          </AppText>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-ds-control border border-border bg-surfaceAlt px-4 py-3.5 dark:border-border-dark dark:bg-surfaceAlt-dark"
            onPress={onStartDatePress}
            activeOpacity={0.85}
          >
            <AppText variant="body" tone="default" className="normal-case">
              {parseLocalDate(startDate).toLocaleDateString()}
            </AppText>
            <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
          {showStartDatePicker && Platform.OS === "ios" && (
            <View key="start-date-picker">
              <DateTimePicker
                value={parseLocalDate(startDate)}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            </View>
          )}
          {showStartDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={parseLocalDate(startDate)}
              mode="date"
              display="default"
              onChange={onStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        <View className="flex-1">
          <AppText variant="caption" tone="muted" className="mb-2 normal-case">
            End date (optional)
          </AppText>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-ds-control border border-border bg-surfaceAlt px-4 py-3.5 dark:border-border-dark dark:bg-surfaceAlt-dark"
            onPress={onEndDatePress}
            activeOpacity={0.85}
          >
            <AppText
              variant="body"
              tone={endDate ? "default" : "muted"}
              className="normal-case"
            >
              {endDate
                ? parseLocalDate(endDate).toLocaleDateString()
                : "No end date"}
            </AppText>
            <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
          {showEndDatePicker && Platform.OS === "ios" && (
            <View key="end-date-picker">
              <DateTimePicker
                value={endDate ? parseLocalDate(endDate) : new Date()}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={parseLocalDate(startDate)}
              />
            </View>
          )}
          {showEndDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={endDate ? parseLocalDate(endDate) : new Date()}
              mode="date"
              display="default"
              onChange={onEndDateChange}
              minimumDate={parseLocalDate(startDate)}
            />
          )}
          {recurrenceType !== "once" && !endDate ? (
            <AppText variant="caption" tone="muted" className="mt-2 normal-case">
              Will default to end of {new Date().getFullYear()}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}
