import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/authcontext";
import { getUserSchedules, ScheduledWorkout, deleteSchedule } from "../lib/scheduleUtils";
import ScheduleCard from "../components/schedules/ScheduleCard";
import ScheduleWorkoutModal from "../components/scheduleworkoutmodal";
import Header from "../components/header";

export default function SchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [schedules, setSchedules] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledWorkout | null>(null);

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
      ]
    );
  };

  const handleCloseModal = () => {
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  const activeSchedules = schedules.filter((s) => s.schedule.is_active);
  const inactiveSchedules = schedules.filter((s) => !s.schedule.is_active);

  return (
    <View className="flex-1 bg-base-100">
      <View
        className="bg-base-200 px-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-2 -ml-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#ff4b8c" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-base-content">
                Manage Schedules
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setIsScheduleModalOpen(true)}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add-circle-outline" size={28} color="#ff4b8c" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff4b8c" />
          <Text className="text-muted mt-2">Loading schedules...</Text>
        </View>
      ) : schedules.length === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View className="items-center py-8">
            <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            <Text className="text-xl font-semibold text-base-content mt-4 text-center">
              No Schedules Yet
            </Text>
            <Text className="text-sm text-muted text-center mt-2 mb-6">
              Create your first workout schedule to start planning your
              workouts ahead of time.
            </Text>
            <TouchableOpacity
              onPress={() => setIsScheduleModalOpen(true)}
              className="px-6 py-3 bg-primary rounded-xl flex-row items-center gap-2"
              style={{
                shadowColor: "#ff4b8c",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text className="text-primary-content font-semibold text-base">
                Schedule Your First Workout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          {activeSchedules.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-base-content mb-3">
                Active Schedules ({activeSchedules.length})
              </Text>
              <View className="gap-3">
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

          {inactiveSchedules.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-base-content mb-3">
                Inactive Schedules ({inactiveSchedules.length})
              </Text>
              <View className="gap-3">
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

      {/* Schedule Workout Modal */}
      <ScheduleWorkoutModal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseModal}
        onScheduleCreated={handleScheduleCreated}
        editingSchedule={editingSchedule}
      />
    </View>
  );
}


