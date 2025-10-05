import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return "In Progress";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const getWorkoutIcon = (workoutName: string) => {
    return "barbell-outline" as const;
  };

  return (
    <View className="mt-3">
      {/* Enhanced Tab Selector */}
      <View className="flex-row justify-center mb-6">
        <View className="flex-row bg-base-300 rounded-xl p-1">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              selectedTab === "week" ? "bg-primary" : "bg-transparent"
            }`}
            onPress={() => setSelectedTab("week")}
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
            onPress={() => setSelectedTab("month")}
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
            onPress={() => setSelectedTab("all")}
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

      {/* Sessions List */}
      {!loading && (
        <View className="px-4">
          {selectedSessions.length > 0 ? (
            <View className="gap-4">
              {selectedSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  className="bg-base-200 rounded-xl p-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => handleSessionClick(session.id)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center gap-3">
                      {/* Workout Icon */}
                      <View
                        className={`w-12 h-12 rounded-xl items-center justify-center ${
                          session.completed ? "bg-success/20" : "bg-warning/20"
                        }`}
                      >
                        <Ionicons
                          name={getWorkoutIcon(session.name)}
                          size={24}
                          color={session.completed ? "#10b981" : "#f59e0b"}
                        />
                      </View>

                      {/* Session Info */}
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-base-content">
                          {session.name}
                        </Text>
                        <View className="flex-row items-center gap-3 mt-1">
                          <Text className="text-sm text-muted">
                            {new Date(session.started_at).toLocaleDateString()}
                          </Text>
                          <Text className="text-sm text-muted">
                            {formatDuration(
                              session.started_at,
                              session.ended_at
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Status and Arrow */}
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`px-3 py-1 rounded-full ${
                          session.completed ? "bg-success/10" : "bg-warning/10"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            session.completed ? "text-success" : "text-warning"
                          }`}
                        >
                          {session.completed ? "Completed" : "In Progress"}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#9ca3af"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-12">
              <View className="items-center">
                <View className="w-20 h-20 bg-base-300 rounded-full items-center justify-center mb-4">
                  <Ionicons name="fitness-outline" size={40} color="#9ca3af" />
                </View>
                <Text className="text-xl font-bold text-base-content mb-2">
                  No Sessions Yet
                </Text>
                <Text className="text-center text-muted mb-6 max-w-xs">
                  {selectedTab === "week" &&
                    "Start your week strong with a new workout session!"}
                  {selectedTab === "month" &&
                    "Ready to make this month count? Start a new session!"}
                  {selectedTab === "all" &&
                    "Ready to begin your fitness journey? Let's start with your first session!"}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="arrow-up" size={16} color="#ff4b8c" />
                  <Text className="text-sm font-medium text-primary">
                    Tap "Start New Session" above
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SessionTabs;
