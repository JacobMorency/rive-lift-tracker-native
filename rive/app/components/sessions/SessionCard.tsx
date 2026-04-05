import React from "react";
import { View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "./types";
import AppCard from "../ui/AppCard";
import AppText from "../ui/AppText";

type SessionCardProps = {
  session: Session;
  onPress: () => void;
};

/** Elapsed from start to now (in-progress meta line). */
const formatElapsedShort = (startTime: string) => {
  const diffMs = Date.now() - new Date(startTime).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatSessionClock = (startTime: string, endTime: string | null) => {
  const endMs = endTime ? new Date(endTime).getTime() : Date.now();
  const startMs = new Date(startTime).getTime();
  const diffMs = Math.max(0, endMs - startMs);
  const totalSec = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function SessionCard({ session, onPress }: SessionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isUnknown = session.name === "Unknown Workout";
  const inProgress = !session.completed;
  const dateStr = new Date(session.started_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const iconTint = inProgress
    ? isDark
      ? "#ff6fa1"
      : "#ff4b8c"
    : isDark
      ? "#a1a1aa"
      : "#6b7280";

  return (
    <AppCard
      onPress={onPress}
      className={`relative overflow-hidden ${
        inProgress ? "border border-primary/20 dark:border-primary-dark/30" : ""
      }`}
    >
      {inProgress ? (
        <View className="absolute top-3 right-3 z-10">
          <View className="flex-row items-center gap-1.5 rounded-full bg-primary/10 dark:bg-primary-dark/15 px-2.5 py-1">
            <View className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-dark" />
            <AppText
              variant="caption"
              tone="primary"
              className="text-[10px] font-bold"
            >
              In progress
            </AppText>
          </View>
        </View>
      ) : null}

      <View
        className={`flex-row items-center gap-4 ${inProgress ? "py-8" : ""}`}
      >
        <AppCard
          surface="alt"
          radius="tag"
          className="items-center justify-center"
        >
          <Ionicons
            name={isUnknown ? "help-circle-outline" : "barbell-outline"}
            size={22}
            color={iconTint}
          />
        </AppCard>

        <View className="flex-1 min-w-0">
          <View
            className={`flex-row items-start justify-between gap-2 ${
              inProgress ? "pr-14" : ""
            }`}
          >
            <AppText variant="body" className="font-bold flex-1 leading-tight">
              {session.name}
            </AppText>
            {!inProgress ? (
              <AppText
                variant="caption"
                tone="muted"
                className="font-mono shrink-0"
              >
                {formatSessionClock(session.started_at, session.ended_at)}
              </AppText>
            ) : null}
          </View>
          <View className="mt-1 flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <AppText
              variant="caption"
              tone="muted"
              className="normal-case font-medium"
            >
              {dateStr}
            </AppText>
            {inProgress ? (
              <>
                <View className="h-1 w-1 rounded-full bg-border dark:bg-border-dark" />
                <AppText
                  variant="caption"
                  tone="muted"
                  className="normal-case font-medium"
                >
                  {formatElapsedShort(session.started_at)} elapsed
                </AppText>
              </>
            ) : null}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
      </View>
    </AppCard>
  );
}
