import React, { useState } from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { DateRange } from "../lib/statsUtils";
import Header from "../components/header";
import DateRangePicker from "../components/daterangepicker";
import OverviewTab from "../components/stats/overviewtab";
import PRsTab from "../components/stats/prstab";

type TabType = "overview" | "prs";

export default function StatsPage() {
  const { userData } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({ type: "all" });
  const [selectedTab, setSelectedTab] = useState<TabType>("overview");
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: "overview" as TabType, label: "Overview" },
    { id: "prs" as TabType, label: "PRs" },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case "overview":
        return <OverviewTab dateRange={dateRange} />;
      case "prs":
        return <PRsTab dateRange={dateRange} />;
      default:
        return <OverviewTab dateRange={dateRange} />;
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-zinc-900">
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
        <View className="flex-row bg-gray-100 dark:bg-zinc-700 rounded-xl p-1">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`px-4 py-2 rounded-lg ${
                selectedTab === tab.id ? "bg-[#ff4b8c] dark:bg-[#ff6fa1]" : "bg-transparent"
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedTab === tab.id
                    ? "text-white"
                    : "text-zinc-900 dark:text-white"
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
