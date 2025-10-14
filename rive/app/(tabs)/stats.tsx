import React, { useState } from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { DateRange } from "../lib/statsUtils";
import Header from "../components/header";
import DateRangePicker from "../components/daterangepicker";
import ExercisesTab from "../components/stats/exercisestab";
import PRsTab from "../components/stats/prstab";

type TabType = "exercises" | "prs";

export default function StatsPage() {
  const { userData } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({ type: "all" });
  const [selectedTab, setSelectedTab] = useState<TabType>("exercises");
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: "exercises" as TabType, label: "Exercises" },
    { id: "prs" as TabType, label: "PRs" },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case "exercises":
        return <ExercisesTab dateRange={dateRange} />;
      case "prs":
        return <PRsTab dateRange={dateRange} />;
      default:
        return <ExercisesTab dateRange={dateRange} />;
    }
  };

  return (
    <View className="flex-1 bg-base-100">
      <Header
        title="Stats"
        subtitle={
          userData
            ? `Your fitness progress, ${userData.first_name} 📊`
            : undefined
        }
        rightComponent={
          <DateRangePicker
            selectedRange={dateRange}
            onRangeChange={setDateRange}
          />
        }
      />

      {/* Tab Selector */}
      <View className="flex-row justify-center mb-6 mt-3">
        <View className="flex-row bg-base-300 rounded-xl p-1">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`px-4 py-2 rounded-lg ${
                selectedTab === tab.id ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedTab === tab.id
                    ? "text-primary-content"
                    : "text-base-content"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
