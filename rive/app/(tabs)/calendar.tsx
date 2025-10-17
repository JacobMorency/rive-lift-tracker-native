import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import Header from "../components/header";
import ScheduleWorkoutModal from "../components/scheduleworkoutmodal";
import ScheduleListItem from "../components/schedulelistitem";
import {
  getScheduledWorkoutsForDate,
  getScheduledWorkoutsForMonth,
  ScheduledWorkout,
  CalendarMarker,
} from "../lib/scheduleUtils";

export default function CalendarPage() {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [scheduledWorkouts, setScheduledWorkouts] = useState<
    ScheduledWorkout[]
  >([]);
  const [calendarMarkers, setCalendarMarkers] = useState<Record<string, any>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const fetchScheduledWorkouts = useCallback(
    async (date: string) => {
      if (!user) return;

      try {
        setLoading(true);
        const dateObj = new Date(date);
        const workouts = await getScheduledWorkoutsForDate(user.id, dateObj);
        setScheduledWorkouts(workouts);
      } catch (error) {
        console.error("Error fetching scheduled workouts:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const fetchCalendarMarkers = useCallback(async () => {
    if (!user) return;

    try {
      const currentDate = new Date(selectedDate);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const markers = await getScheduledWorkoutsForMonth(user.id, year, month);

      // Convert markers to react-native-calendars format
      const markedDates: Record<string, any> = {};
      markers.forEach((marker) => {
        markedDates[marker.date] = {
          marked: true,
          dots: marker.dots,
        };
      });

      setCalendarMarkers(markedDates);
    } catch (error) {
      console.error("Error fetching calendar markers:", error);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user) {
      fetchScheduledWorkouts(selectedDate);
      fetchCalendarMarkers();
    }
  }, [user, selectedDate, fetchScheduledWorkouts, fetchCalendarMarkers]);

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleScheduleCreated = () => {
    fetchScheduledWorkouts(selectedDate);
    fetchCalendarMarkers();
  };

  const handleScheduleDeleted = () => {
    fetchScheduledWorkouts(selectedDate);
    fetchCalendarMarkers();
  };

  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateString === today;
  };

  return (
    <View className="flex-1 bg-base-100">
      <Header
        title="Calendar"
        subtitle={userData ? "Schedule and track your workouts" : undefined}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Calendar */}
        <View className="p-4">
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={{
              ...calendarMarkers,
              [selectedDate]: {
                ...calendarMarkers[selectedDate],
                selected: true,
                selectedColor: "#ff4b8c",
              },
            }}
            theme={{
              backgroundColor: "#1a1a1a",
              calendarBackground: "#1a1a1a",
              textSectionTitleColor: "#ffffff",
              selectedDayBackgroundColor: "#ff4b8c",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#ff4b8c",
              dayTextColor: "#ffffff",
              textDisabledColor: "#6b7280",
              dotColor: "#ff4b8c",
              selectedDotColor: "#ff4b8c",
              arrowColor: "#ff4b8c",
              disabledArrowColor: "#6b7280",
              monthTextColor: "#ffffff",
              indicatorColor: "#ff4b8c",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            style={{
              borderRadius: 12,
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          />
        </View>

        {/* Selected Date Header */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-base-content">
                {formatSelectedDate(selectedDate)}
              </Text>
              {isToday(selectedDate) && (
                <Text className="text-primary text-sm font-medium">Today</Text>
              )}
            </View>
            <TouchableOpacity
              className="bg-primary rounded-lg px-4 py-2 flex-row items-center"
              onPress={() => setIsScheduleModalOpen(true)}
            >
              <Ionicons name="add" size={16} color="#ffffff" />
              <Text className="text-primary-content font-medium ml-1">
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scheduled Workouts List */}
        <View className="px-4">
          {loading ? (
            <View className="flex-row items-center justify-center py-8">
              <ActivityIndicator size="small" color="#ff4b8c" />
              <Text className="text-muted ml-2">Loading workouts...</Text>
            </View>
          ) : scheduledWorkouts.length === 0 ? (
            <View className="items-center py-12">
              <View className="w-16 h-16 bg-base-300 rounded-full items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={32} color="#9ca3af" />
              </View>
              <Text className="text-lg font-semibold text-base-content mb-2">
                No Workouts Scheduled
              </Text>
              <Text className="text-muted text-center mb-6 max-w-xs">
                {isToday(selectedDate)
                  ? "No workouts scheduled for today. Schedule one to get started!"
                  : "No workouts scheduled for this day. Tap 'Schedule' to add one."}
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-lg px-6 py-3 flex-row items-center"
                onPress={() => setIsScheduleModalOpen(true)}
              >
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text className="text-primary-content font-medium ml-1">
                  Schedule Workout
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-base-content font-medium mb-3">
                Scheduled Workouts ({scheduledWorkouts.length})
              </Text>
              {scheduledWorkouts.map((scheduledWorkout) => (
                <ScheduleListItem
                  key={scheduledWorkout.schedule.id}
                  scheduledWorkout={scheduledWorkout}
                  onScheduleDeleted={handleScheduleDeleted}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Schedule Modal */}
      <ScheduleWorkoutModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleCreated={handleScheduleCreated}
      />
    </View>
  );
}
