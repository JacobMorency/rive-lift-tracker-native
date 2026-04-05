import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecurrenceType } from "../../lib/scheduleUtils";
import {
  getRecurrenceOptions,
  getRecurrenceDisplayText,
} from "./types";
import AppText from "../ui/AppText";

type RecurrenceSelectorProps = {
  recurrenceType: RecurrenceType;
  startDate: string;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectRecurrence: (type: RecurrenceType) => void;
};

export default function RecurrenceSelector({
  recurrenceType,
  startDate,
  showDropdown,
  onToggleDropdown,
  onSelectRecurrence,
}: RecurrenceSelectorProps) {
  return (
    <View className="mb-6">
      <AppText variant="caption" tone="muted" className="mb-2 normal-case">
        Repeat
      </AppText>
      <TouchableOpacity
        className="flex-row items-center justify-between rounded-ds-control border border-border bg-surfaceAlt px-4 py-3.5 dark:border-border-dark dark:bg-surfaceAlt-dark"
        onPress={onToggleDropdown}
        activeOpacity={0.85}
      >
        <AppText variant="body" tone="default" className="flex-1 normal-case">
          {getRecurrenceDisplayText(recurrenceType, startDate)}
        </AppText>
        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color="#9ca3af"
        />
      </TouchableOpacity>

      {showDropdown ? (
        <View className="mt-2 overflow-hidden rounded-ds-card border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
          {getRecurrenceOptions(startDate).map((option) => {
            const active = recurrenceType === option.type;
            return (
              <TouchableOpacity
                key={option.type}
                className={`border-b border-border px-4 py-3.5 dark:border-border-dark last:border-b-0 ${
                  active ? "bg-primary/8 dark:bg-primary-dark/12" : ""
                }`}
                onPress={() => onSelectRecurrence(option.type)}
                activeOpacity={0.85}
              >
                <AppText
                  variant="body"
                  tone={active ? "primary" : "default"}
                  className="font-medium normal-case"
                >
                  {option.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
