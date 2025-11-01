import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type SessionTabsHeaderProps = {
  selectedTab: string;
  onTabChange: (tab: string) => void;
};

export default function SessionTabsHeader({
  selectedTab,
  onTabChange,
}: SessionTabsHeaderProps) {
  return (
    <View className="flex-row justify-center mb-6">
      <View className="flex-row bg-base-300 rounded-xl p-1">
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${
            selectedTab === "week" ? "bg-primary" : "bg-transparent"
          }`}
          onPress={() => onTabChange("week")}
        >
          <Text
            className={`text-sm font-medium ${
              selectedTab === "week"
                ? "text-primary-content"
                : "text-base-content"
            }`}
          >
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${
            selectedTab === "month" ? "bg-primary" : "bg-transparent"
          }`}
          onPress={() => onTabChange("month")}
        >
          <Text
            className={`text-sm font-medium ${
              selectedTab === "month"
                ? "text-primary-content"
                : "text-base-content"
            }`}
          >
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${
            selectedTab === "all" ? "bg-primary" : "bg-transparent"
          }`}
          onPress={() => onTabChange("all")}
        >
          <Text
            className={`text-sm font-medium ${
              selectedTab === "all"
                ? "text-primary-content"
                : "text-base-content"
            }`}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

