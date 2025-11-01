import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Session } from "./sessions/types";
import SessionTabsHeader from "./sessions/SessionTabsHeader";
import SessionList from "./sessions/SessionList";

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

  return (
    <View className="mt-3">
      <SessionTabsHeader
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {!loading && (
        <SessionList
          sessions={selectedSessions}
          selectedTab={selectedTab}
          onSessionSelect={onSessionSelect}
        />
      )}
    </View>
  );
};

export default SessionTabs;
