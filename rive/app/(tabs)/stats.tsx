import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DateRange } from "../lib/statsUtils";
import Header from "../components/Header";
import DateRangePicker from "../components/DateRangePicker";
import OverviewTab from "../components/stats/OverviewTab";
import PRsTab from "../components/stats/PRsTab";
import AppText from "../components/ui/AppText";

type TabType = "overview" | "prs";

function getDateRangeLabel(dateRange: DateRange): string {
  switch (dateRange.type) {
    case "week":
      return "Last 7 days";
    case "month":
      return "Last 30 days";
    case "year":
      return "Last year";
    case "custom":
      return "Custom range";
    default:
      return "All time";
  }
}

export default function StatsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({ type: "all" });
  const [selectedTab, setSelectedTab] = useState<TabType>("overview");
  const insets = useSafeAreaInsets();

  const rangeLabel = useMemo(
    () => getDateRangeLabel(dateRange),
    [dateRange],
  );

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
    <View className="flex-1 bg-background dark:bg-background-dark">
      <Header
        rightComponent={
          <DateRangePicker
            selectedRange={dateRange}
            onRangeChange={setDateRange}
          />
        }
      />

      <View className="px-4 pt-3 pb-2">
        <View className="flex-row rounded-2xl bg-surfaceAlt p-1 dark:bg-surfaceAlt-dark">
          {tabs.map((tab) => {
            const selected = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                className={`flex-1 rounded-xl py-2.5 ${
                  selected ? "bg-primary dark:bg-primary-dark" : ""
                }`}
                onPress={() => setSelectedTab(tab.id)}
                activeOpacity={0.85}
              >
                <AppText
                  variant="body"
                  tone={selected ? "inverse" : "default"}
                  className="text-center font-semibold normal-case"
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-end justify-between">
          <View className="min-w-0 flex-1 pr-3">
            <AppText variant="caption" tone="primary" className="mb-1 font-bold normal-case">
              Insights
            </AppText>
            <AppText variant="header" tone="default">
              {selectedTab === "overview" ? "Overview" : "Personal records"}
            </AppText>
          </View>
          <AppText
            variant="caption"
            tone="muted"
            className="shrink-0 normal-case"
          >
            {rangeLabel}
          </AppText>
        </View>

        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
