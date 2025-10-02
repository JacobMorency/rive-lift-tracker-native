import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

type Session = {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
};

type SessionTabsProps = {
  sessions: Session[];
  onSessionSelect: (sessionId: string) => void;
};

const SessionTabs = ({ sessions, onSessionSelect }: SessionTabsProps) => {
  const [selectedSessions, setSelectedSessions] = useState<Session[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("week");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchWeeklySessions = (): void => {
      const today = new Date();
      const currentYear = today.getFullYear();

      // Set start of the week to Sunday at 00:00
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Set end of the week to Saturday at 23:59
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      const weeklySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.started_at);
        sessionDate.setHours(0, 0, 0, 0);
        return (
          sessionDate >= startOfWeek &&
          sessionDate <= endOfWeek &&
          sessionDate.getFullYear() === currentYear
        );
      });

      setSelectedSessions(weeklySessions);
      setLoading(false);
    };

    const fetchMonthlySessions = (): void => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const monthlySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.started_at);
        return (
          sessionDate.getMonth() === currentMonth &&
          sessionDate.getFullYear() === currentYear
        );
      });

      setSelectedSessions(monthlySessions);
      setLoading(false);
    };

    const fetchAllSessions = (): void => {
      setSelectedSessions(sessions);
      setLoading(false);
    };

    if (selectedTab === "week") fetchWeeklySessions();
    else if (selectedTab === "month") fetchMonthlySessions();
    else if (selectedTab === "all") fetchAllSessions();
  }, [sessions, selectedTab]);

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId);
  };

  return (
    <View className="mt-3">
      {/* Tab Selector */}
      <View className="flex-row justify-center mb-4">
        <View
          className="flex-row rounded-lg p-1"
          style={{ backgroundColor: "#333333" }}
        >
          <TouchableOpacity
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor:
                selectedTab === "week" ? "#ff4b8c" : "transparent",
            }}
            onPress={() => setSelectedTab("week")}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color: selectedTab === "week" ? "#ffffff" : "#fefbee",
              }}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor:
                selectedTab === "month" ? "#ff4b8c" : "transparent",
            }}
            onPress={() => setSelectedTab("month")}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color: selectedTab === "month" ? "#ffffff" : "#fefbee",
              }}
            >
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor:
                selectedTab === "all" ? "#ff4b8c" : "transparent",
            }}
            onPress={() => setSelectedTab("all")}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color: selectedTab === "all" ? "#ffffff" : "#fefbee",
              }}
            >
              All Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sessions List */}
      {!loading && (
        <View className="px-4">
          {selectedSessions.length > 0 ? (
            <View>
              {selectedSessions.map((session, index) => (
                <View key={session.id}>
                  <TouchableOpacity
                    className="rounded-lg p-4"
                    style={{ backgroundColor: "#333333" }}
                    onPress={() => handleSessionClick(session.id)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className="text-lg font-medium"
                          style={{ color: "#fefbee" }}
                        >
                          {session.name}
                        </Text>
                        <Text
                          className="text-sm mt-1"
                          style={{ color: "#9ca3af" }}
                        >
                          {new Date(session.started_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: session.completed
                              ? "#22c55e"
                              : "#facc15",
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{
                              color: session.completed ? "#002d40" : "#002d40",
                            }}
                          >
                            {session.completed ? "Completed" : "In Progress"}
                          </Text>
                        </View>
                        <Text className="text-xs" style={{ color: "#9ca3af" }}>
                          ›
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {index < selectedSessions.length - 1 && (
                    <View className="mb-3" />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-6xl mb-4">▶️</Text>
              <Text
                className="text-lg font-semibold mb-2"
                style={{ color: "#fefbee" }}
              >
                No Sessions
              </Text>
              <Text className="text-center" style={{ color: "#9ca3af" }}>
                {selectedTab === "week" && "No sessions this week."}
                {selectedTab === "month" && "No sessions this month."}
                {selectedTab === "all" && "No sessions yet."}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SessionTabs;
