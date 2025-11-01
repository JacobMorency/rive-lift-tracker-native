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
          <Text className="text-base-content font-medium mb-2">Start Date</Text>
          <TouchableOpacity
            className="bg-base-200 rounded-lg p-3 flex-row items-center justify-between"
            onPress={onStartDatePress}
          >
            <Text className="text-base-content">
              {new Date(
                new Date(startDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={new Date(startDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base-content font-medium mb-2">
            End Date (Optional)
          </Text>
          <TouchableOpacity
            className="bg-base-200 rounded-lg p-3 flex-row items-center justify-between"
            onPress={onEndDatePress}
          >
            <Text className="text-base-content">
              {endDate
                ? new Date(
                    new Date(endDate).getTime() + 24 * 60 * 60 * 1000
                  ).toLocaleDateString()
                : "No end date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onEndDateChange}
              minimumDate={new Date(startDate)}
            />
          )}
          {recurrenceType !== "once" && !endDate && (
            <Text className="text-xs text-base-content/60 mt-1">
              Will default to end of {new Date().getFullYear()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

