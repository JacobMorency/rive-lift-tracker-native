import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import {
  WorkoutSchedule,
  RecurrenceType,
  createSchedule,
} from "../lib/scheduleUtils";
import WorkoutSelector from "./schedule/WorkoutSelector";
import DateSelection from "./schedule/DateSelection";
import RecurrenceSelector from "./schedule/RecurrenceSelector";
import RecurrenceOptions from "./schedule/RecurrenceOptions";

type ScheduleWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScheduleCreated?: () => void;
  selectedDate?: string; // ISO date string (YYYY-MM-DD)
};

export default function ScheduleWorkoutModal({
  isOpen,
  onClose,
  onScheduleCreated,
  selectedDate,
}: ScheduleWorkoutModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
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

  useEffect(() => {
    if (isOpen && user) {
      fetchWorkoutTemplates();
    }
  }, [isOpen, user]);

  // Cleanup date pickers when modal is closed - do this synchronously
  useEffect(() => {
    if (!isOpen) {
      // Close pickers immediately to prevent lifecycle issues
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  }, [isOpen]);

  // Update startDate when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  }, [selectedDate]);

  // Update selected day when start date changes for weekly recurrence
  useEffect(() => {
    if (recurrenceType === "weekly" && startDate) {
      const dayOfWeek = new Date(startDate).getDay();
      setSelectedDays([dayOfWeek]);
    }
  }, [startDate, recurrenceType]);

  const fetchWorkoutTemplates = async () => {
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
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    // Hide picker immediately to prevent lifecycle issues
    setShowStartDatePicker(false);

    // Only update if user actually selected a date (not dismissed)
    if (event.type === "set" && selectedDate) {
      // Format date in local timezone to match calendar format
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setStartDate(dateString);

      // Update weekly recurrence day if it's set to weekly
      if (recurrenceType === "weekly") {
        const dayOfWeek = selectedDate.getDay();
        setSelectedDays([dayOfWeek]);
      }

      // Update monthly date if it's set to monthly_date
      if (recurrenceType === "monthly_date") {
        const dateOfMonth = selectedDate.getDate();
        setSelectedDates([dateOfMonth]);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    // Hide picker immediately to prevent lifecycle issues
    setShowEndDatePicker(false);

    // Only update if user actually selected a date (not dismissed)
    if (event.type === "set" && selectedDate) {
      // Format date in local timezone to match calendar format
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setEndDate(dateString);
    }
  };

  const handleRecurrenceTypeChange = (type: RecurrenceType) => {
    setRecurrenceType(type);
    setShowRecurrenceDropdown(false);
    // Reset selections when changing type
    setSelectedDays([]);
    setSelectedDates([]);

    // For weekly, automatically set the day based on start date
    if (type === "weekly" && startDate) {
      // Parse the date string as local time to avoid timezone issues
      const [year, month, day] = startDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      setSelectedDays([dayOfWeek]);
    }
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDateToggle = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
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
        "Please select a start date to determine the day of the week"
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
      // If no end date is specified for recurring schedules, default to end of current year
      let finalEndDate = endDate;
      if (!finalEndDate && recurrenceType !== "once") {
        const currentYear = new Date().getFullYear();
        finalEndDate = `${currentYear}-12-31`;
      }

      const scheduleData: Omit<
        WorkoutSchedule,
        "id" | "created_at" | "updated_at"
      > = {
        user_id: user.id,
        workout_id: selectedWorkoutId,
        recurrence_type: recurrenceType,
        recurrence_days:
          recurrenceType === "weekly" ? selectedDays : selectedDates,
        start_date: startDate,
        end_date: finalEndDate || null,
        is_active: true,
      };

      const result = await createSchedule(scheduleData);

      if (result) {
        Alert.alert("Success", "Workout scheduled successfully!");
        onScheduleCreated?.();
        onClose();
        resetForm();
      } else {
        Alert.alert("Error", "Failed to create schedule");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      Alert.alert("Error", "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedWorkoutId("");
    // Use selectedDate if provided, otherwise use today's date in local timezone
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


  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-base-100" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-base-300">
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-primary font-medium">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-base-content">
            Schedule Workout
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text className="text-primary font-medium">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
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
      </View>
    </Modal>
  );
}
