import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import {
  WorkoutSchedule,
  RecurrenceType,
  createSchedule,
  updateSchedule,
  ScheduledWorkout,
} from "../../lib/scheduleUtils";
import WorkoutSelector from "../schedule/WorkoutSelector";
import DateSelection from "../schedule/DateSelection";
import RecurrenceSelector from "../schedule/RecurrenceSelector";
import RecurrenceOptions from "../schedule/RecurrenceOptions";
import { WorkoutTemplate } from "../schedule/types";
import AppText from "../ui/AppText";
import StickyBottomPrimaryButton, {
  STICKY_BOTTOM_PRIMARY_SCROLL_PADDING,
} from "../ui/StickyBottomPrimaryButton";

type ScheduleWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScheduleCreated?: () => void;
  selectedDate?: string; // ISO date string (YYYY-MM-DD)
  editingSchedule?: ScheduledWorkout | null; // Schedule to edit
};

export default function ScheduleWorkoutModal({
  isOpen,
  onClose,
  onScheduleCreated,
  selectedDate,
  editingSchedule,
}: ScheduleWorkoutModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    [],
  );
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(() => {
    if (selectedDate) {
      return selectedDate;
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  });
  const [endDate, setEndDate] = useState<string>("");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("once");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const fetchWorkoutTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("id, name, description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workout templates:", error);
        return;
      }

      setWorkoutTemplates(data || []);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchWorkoutTemplates();
    }
  }, [isOpen, user, fetchWorkoutTemplates]);

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingSchedule) {
      const { schedule } = editingSchedule;
      setSelectedWorkoutId(schedule.workout_id);
      setStartDate(schedule.start_date);
      setEndDate(schedule.end_date || "");
      setRecurrenceType(schedule.recurrence_type);
      setSelectedDays(
        schedule.recurrence_type === "weekly" ? schedule.recurrence_days : [],
      );
      setSelectedDates(
        schedule.recurrence_type === "monthly_date"
          ? schedule.recurrence_days
          : [],
      );
    } else if (isOpen && !editingSchedule) {
      resetForm();
    }
    // resetForm is intentionally omitted: only reset when opening create flow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingSchedule]);

  useEffect(() => {
    if (!isOpen) {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (recurrenceType === "weekly" && startDate) {
      const [year, month, day] = startDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      setSelectedDays([dayOfWeek]);
    }
  }, [startDate, recurrenceType]);

  const handleStartDateChange = (event: any, selectedPickerDate?: Date) => {
    setShowStartDatePicker(false);

    if (event.type === "set" && selectedPickerDate) {
      const year = selectedPickerDate.getFullYear();
      const month = String(selectedPickerDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedPickerDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setStartDate(dateString);

      if (recurrenceType === "weekly") {
        const dayOfWeek = selectedPickerDate.getDay();
        setSelectedDays([dayOfWeek]);
      }

      if (recurrenceType === "monthly_date") {
        const dateOfMonth = selectedPickerDate.getDate();
        setSelectedDates([dateOfMonth]);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedPickerDate?: Date) => {
    setShowEndDatePicker(false);

    if (event.type === "set" && selectedPickerDate) {
      const year = selectedPickerDate.getFullYear();
      const month = String(selectedPickerDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedPickerDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setEndDate(dateString);
    }
  };

  const handleRecurrenceTypeChange = (type: RecurrenceType) => {
    setRecurrenceType(type);
    setShowRecurrenceDropdown(false);
    setSelectedDays([]);
    setSelectedDates([]);

    if (type === "weekly" && startDate) {
      const [year, month, day] = startDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      setSelectedDays([dayOfWeek]);
    }
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleDateToggle = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );
  };

  const validateForm = (): boolean => {
    if (!selectedWorkoutId) {
      Alert.alert("Error", "Please select a workout template");
      return false;
    }

    if (!startDate) {
      Alert.alert("Error", "Please select a start date");
      return false;
    }

    if (recurrenceType === "weekly" && selectedDays.length === 0) {
      Alert.alert(
        "Error",
        "Please select a start date to determine the day of the week",
      );
      return false;
    }

    if (recurrenceType === "monthly_date" && selectedDates.length === 0) {
      Alert.alert("Error", "Please select at least one date of the month");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);

    try {
      let finalEndDate = endDate;
      if (!finalEndDate && recurrenceType !== "once") {
        const currentYear = new Date().getFullYear();
        finalEndDate = `${currentYear}-12-31`;
      }

      const scheduleData: Partial<
        Omit<WorkoutSchedule, "id" | "created_at" | "updated_at">
      > = {
        workout_id: selectedWorkoutId,
        recurrence_type: recurrenceType,
        recurrence_days:
          recurrenceType === "weekly" ? selectedDays : selectedDates,
        start_date: startDate,
        end_date: finalEndDate || null,
        is_active: editingSchedule?.schedule.is_active ?? true,
      };

      let result;
      if (editingSchedule) {
        result = await updateSchedule(editingSchedule.schedule.id, scheduleData);
        if (result) {
          Alert.alert("Success", "Schedule updated successfully!");
          onScheduleCreated?.();
          onClose();
          resetForm();
        } else {
          Alert.alert("Error", "Failed to update schedule");
        }
      } else {
        const newScheduleData = {
          ...scheduleData,
          user_id: user.id,
        } as Omit<WorkoutSchedule, "id" | "created_at" | "updated_at">;

        result = await createSchedule(newScheduleData);
        if (result) {
          Alert.alert("Success", "Workout scheduled successfully!");
          onScheduleCreated?.();
          onClose();
          resetForm();
        } else {
          Alert.alert("Error", "Failed to create schedule");
        }
      }
    } catch (error) {
      console.error(
        `Error ${editingSchedule ? "updating" : "creating"} schedule:`,
        error,
      );
      Alert.alert(
        "Error",
        `Failed to ${editingSchedule ? "update" : "create"} schedule`,
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedWorkoutId("");
    if (selectedDate) {
      setStartDate(selectedDate);
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setStartDate(`${year}-${month}-${day}`);
    }
    setEndDate("");
    setRecurrenceType("once");
    setSelectedDays([]);
    setSelectedDates([]);
    setShowRecurrenceDropdown(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const stickyLabel = editingSchedule ? "Save schedule" : "Schedule workout";
  const stickyA11y = editingSchedule
    ? "Save schedule changes"
    : "Schedule workout";

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-background dark:bg-background-dark">
        <View
          className="border-b border-border bg-chrome px-4 dark:border-border-dark dark:bg-chrome-dark"
          style={{ paddingTop: insets.top, paddingBottom: 8 }}
        >
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <TouchableOpacity
                onPress={handleClose}
                accessibilityLabel="Close"
                className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#f5f5f5" : "#111113"}
                />
              </TouchableOpacity>
              <AppText
                variant="subheader"
                tone="default"
                className="flex-1 font-bold tracking-tight"
                numberOfLines={1}
              >
                {editingSchedule ? "Edit Schedule" : "Schedule Workout"}
              </AppText>
            </View>
            <View className="h-10 w-10 shrink-0" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: STICKY_BOTTOM_PRIMARY_SCROLL_PADDING + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <WorkoutSelector
            templates={workoutTemplates}
            selectedWorkoutId={selectedWorkoutId}
            onSelectWorkout={setSelectedWorkoutId}
          />

          <DateSelection
            startDate={startDate}
            endDate={endDate}
            showStartDatePicker={showStartDatePicker}
            showEndDatePicker={showEndDatePicker}
            recurrenceType={recurrenceType}
            onStartDatePress={() => setShowStartDatePicker(true)}
            onEndDatePress={() => setShowEndDatePicker(true)}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />

          <RecurrenceSelector
            recurrenceType={recurrenceType}
            startDate={startDate}
            showDropdown={showRecurrenceDropdown}
            onToggleDropdown={() =>
              setShowRecurrenceDropdown(!showRecurrenceDropdown)
            }
            onSelectRecurrence={handleRecurrenceTypeChange}
          />

          <RecurrenceOptions
            recurrenceType={recurrenceType}
            selectedDays={selectedDays}
            selectedDates={selectedDates}
            onDayToggle={handleDayToggle}
            onDateToggle={handleDateToggle}
          />
        </ScrollView>

        <StickyBottomPrimaryButton
          label={stickyLabel}
          onPress={handleSave}
          disabled={loading}
          accessibilityLabel={stickyA11y}
          visible={isOpen}
        />
      </View>
    </Modal>
  );
}
