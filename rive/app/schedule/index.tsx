import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import {
  getUserSchedules,
  ScheduledWorkout,
  deleteSchedule,
} from "../lib/scheduleUtils";
import ScheduleCard from "../components/schedule/ScheduleCard";
import ScheduleScreenHeader from "../components/schedule/ScheduleScreenHeader";
import ScheduleWorkoutModal from "../components/modals/ScheduleWorkoutModal";
import AppText from "../components/ui/AppText";
import StickyBottomPrimaryButton, {
  STICKY_BOTTOM_PRIMARY_SCROLL_PADDING,
} from "../components/ui/StickyBottomPrimaryButton";

export default function SchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentIconColor = isDark ? "#ff6fa1" : "#ff4b8c";

  const [schedules, setSchedules] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduledWorkout | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserSchedules(user.id);
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user, fetchSchedules]);

  const handleScheduleCreated = () => {
    fetchSchedules();
    setEditingSchedule(null);
  };

  const handleEdit = (scheduledWorkout: ScheduledWorkout) => {
    setEditingSchedule(scheduledWorkout);
    setIsScheduleModalOpen(true);
  };

  const handleDelete = (scheduleId: string) => {
    Alert.alert(
      "Delete Schedule",
      "Are you sure you want to delete this workout schedule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteSchedule(scheduleId);
            if (success) {
              fetchSchedules();
            } else {
              Alert.alert("Error", "Failed to delete schedule");
            }
          },
        },
      ],
    );
  };

  const handleCloseModal = () => {
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  const openNewScheduleModal = () => {
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const activeSchedules = schedules.filter((s) => s.schedule.is_active);
  const inactiveSchedules = schedules.filter((s) => !s.schedule.is_active);

  const overviewBlock = (
    <View className="mb-6">
      <AppText variant="header" className="mt-2 normal-case">
        Overview
      </AppText>
      <AppText variant="caption" tone="muted" className="normal-case">
        Manage Schedules
      </AppText>
    </View>
  );

  const scrollContentPadding = {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: STICKY_BOTTOM_PRIMARY_SCROLL_PADDING + insets.bottom,
  } as const;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScheduleScreenHeader onBack={() => router.back()} title="Schedules" />

      {loading ? (
        <View className="flex-1 justify-center items-center px-4">
          <ActivityIndicator size="large" color={accentIconColor} />
          <AppText
            variant="body"
            tone="muted"
            className="mt-3 text-center normal-case"
          >
            Loading schedules...
          </AppText>
        </View>
      ) : schedules.length === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            ...scrollContentPadding,
          }}
          showsVerticalScrollIndicator={false}
        >
          {overviewBlock}
          <View className="flex-1 items-center justify-center py-8">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surfaceAlt dark:bg-surfaceAlt-dark">
              <Ionicons name="calendar-outline" size={40} color="#9ca3af" />
            </View>
            <AppText variant="subheader" className="mb-2 text-center">
              No schedules yet
            </AppText>
            <AppText
              variant="caption"
              tone="muted"
              className="max-w-xs text-center normal-case"
            >
              Create your first workout schedule to start planning your workouts
              ahead of time. Use the button below to add one.
            </AppText>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={scrollContentPadding}
          showsVerticalScrollIndicator={false}
        >
          {overviewBlock}

          {activeSchedules.length > 0 && (
            <View className="mb-6">
              <AppText variant="caption" tone="muted" className="mb-4">
                Active schedules ({activeSchedules.length})
              </AppText>
              <View className="gap-4">
                {activeSchedules.map((scheduledWorkout) => (
                  <ScheduleCard
                    key={scheduledWorkout.schedule.id}
                    scheduledWorkout={scheduledWorkout}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            </View>
          )}

          {activeSchedules.length > 0 && inactiveSchedules.length > 0 ? (
            <View className="h-px bg-border dark:bg-border-dark my-6" />
          ) : null}

          {inactiveSchedules.length > 0 && (
            <View className="mb-6">
              <AppText variant="caption" tone="muted" className="mb-4">
                Inactive schedules ({inactiveSchedules.length})
              </AppText>
              <View className="gap-4">
                {inactiveSchedules.map((scheduledWorkout) => (
                  <ScheduleCard
                    key={scheduledWorkout.schedule.id}
                    scheduledWorkout={scheduledWorkout}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <StickyBottomPrimaryButton
        label="Add schedule"
        onPress={openNewScheduleModal}
        accessibilityLabel="Add schedule"
        visible={!loading && !isScheduleModalOpen}
        iconName="add"
      />

      <ScheduleWorkoutModal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseModal}
        onScheduleCreated={handleScheduleCreated}
        editingSchedule={editingSchedule}
      />
    </View>
  );
}
