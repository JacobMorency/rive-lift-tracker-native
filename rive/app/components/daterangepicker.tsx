import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateRange } from "../lib/statsUtils";

type DateRangePickerProps = {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
};

const PRESETS = [
  { type: "week" as const, label: "This Week" },
  { type: "month" as const, label: "This Month" },
  { type: "year" as const, label: "This Year" },
  { type: "all" as const, label: "All Time" },
  { type: "custom" as const, label: "Custom Range" },
];

export default function DateRangePicker({
  selectedRange,
  onRangeChange,
}: DateRangePickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDisplayText = () => {
    switch (selectedRange.type) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "all":
        return "All Time";
      case "custom":
        if (selectedRange.startDate && selectedRange.endDate) {
          const start = selectedRange.startDate.toLocaleDateString();
          const end = selectedRange.endDate.toLocaleDateString();
          return `${start} - ${end}`;
        }
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    if (preset.type === "custom") {
      // For now, just set a default custom range
      // In a full implementation, you'd open a date picker modal
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      onRangeChange({
        type: "custom",
        startDate,
        endDate,
      });
    } else {
      onRangeChange({ type: preset.type });
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalOpen(true)}
        className="flex-row items-center bg-gray-100 dark:bg-zinc-700 px-3 py-2 rounded-lg"
      >
        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
        <Text className="text-sm font-medium text-zinc-900 dark:text-white ml-2">
          {getDisplayText()}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color="#6b7280"
          className="ml-1"
        />
      </TouchableOpacity>

      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
                Select Time Period
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                className="p-1"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-80">
              {PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.type}
                  onPress={() => handlePresetSelect(preset)}
                  className={`flex-row items-center justify-between py-3 px-2 rounded-lg mb-1 ${
                    selectedRange.type === preset.type
                      ? "bg-[#ff4b8c]/10 dark:bg-[#ff6fa1]/10"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedRange.type === preset.type
                        ? "text-[#ff4b8c] dark:text-[#ff6fa1] font-semibold"
                        : "text-zinc-900 dark:text-white"
                    }`}
                  >
                    {preset.label}
                  </Text>
                  {selectedRange.type === preset.type && (
                    <Ionicons name="checkmark" size={20} color="#ff4b8c" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Custom range selection coming soon
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
