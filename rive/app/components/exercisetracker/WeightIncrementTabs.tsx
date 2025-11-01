import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type WeightIncrementTabsProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function WeightIncrementTabs({
  value,
  onChange,
}: WeightIncrementTabsProps) {
  return (
    <View className="mt-4">
      <Text className="text-sm font-semibold text-base-content mb-3">
        Weight Increment
      </Text>
      <View className="flex-row bg-base-300 rounded-xl p-1">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${
            value === 2.5 ? "bg-primary" : "bg-transparent"
          }`}
          onPress={() => onChange(2.5)}
        >
          <Text
            className={`text-center text-sm font-medium ${
              value === 2.5
                ? "text-primary-content"
                : "text-base-content"
            }`}
          >
            2.5 lbs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${
            value === 5 ? "bg-primary" : "bg-transparent"
          }`}
          onPress={() => onChange(5)}
        >
          <Text
            className={`text-center text-sm font-medium ${
              value === 5 ? "text-primary-content" : "text-base-content"
            }`}
          >
            5 lbs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${
            value === 10 ? "bg-primary" : "bg-transparent"
          }`}
          onPress={() => onChange(10)}
        >
          <Text
            className={`text-center text-sm font-medium ${
              value === 10 ? "text-primary-content" : "text-base-content"
            }`}
          >
            10 lbs
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

