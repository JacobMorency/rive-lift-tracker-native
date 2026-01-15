import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

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

// Helper function to parse YYYY-MM-DD date string as local date (not UTC)
// This prevents timezone issues where dates can appear a day behind
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
    <View className="mb-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-zinc-900 dark:text-white font-medium mb-2">Start Date</Text>
          <TouchableOpacity
            className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 flex-row items-center justify-between"
            onPress={onStartDatePress}
          >
            <Text className="text-zinc-900 dark:text-white">
              {parseLocalDate(startDate).toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
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
          <Text className="text-zinc-900 dark:text-white font-medium mb-2">
            End Date (Optional)
          </Text>
          <TouchableOpacity
            className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 flex-row items-center justify-between"
            onPress={onEndDatePress}
          >
            <Text className="text-zinc-900 dark:text-white">
              {endDate
                ? parseLocalDate(endDate).toLocaleDateString()
                : "No end date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
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
          {recurrenceType !== "once" && !endDate && (
            <Text className="text-xs text-zinc-900 dark:text-white/60 mt-1">
              Will default to end of {new Date().getFullYear()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
