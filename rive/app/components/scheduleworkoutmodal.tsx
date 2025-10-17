import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import {
  WorkoutSchedule,
  RecurrenceType,
  createSchedule,
} from "../lib/scheduleUtils";

type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
};

type ScheduleWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScheduleCreated?: () => void;
  selectedDate?: string; // ISO date string (YYYY-MM-DD)
};

const getRecurrenceOptions = (
  startDate: string
): { type: RecurrenceType; label: string }[] => {
  const getWeeklyLabel = () => {
    if (!startDate) return "Weekly";
    const dayOfWeek = new Date(startDate).getDay();
    const dayName =
      DAYS_OF_WEEK.find((day) => day.value === dayOfWeek)?.label || "Unknown";
    return `Weekly on ${dayName}`;
  };

  return [
    { type: "once", label: "Does not repeat" },
    { type: "daily", label: "Daily" },
    { type: "weekly", label: getWeeklyLabel() },
    { type: "monthly", label: "Monthly (same day)" },
    { type: "monthly_date", label: "Monthly (specific dates)" },
  ];
};

const getRecurrenceDisplayText = (
  type: RecurrenceType,
  startDate: string
): string => {
  const options = getRecurrenceOptions(startDate);
  return (
    options.find((option) => option.type === type)?.label || "Does not repeat"
  );
};

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Su" },
  { value: 1, label: "Monday", short: "M" },
  { value: 2, label: "Tuesday", short: "T" },
  { value: 3, label: "Wednesday", short: "W" },
  { value: 4, label: "Thursday", short: "Th" },
  { value: 5, label: "Friday", short: "F" },
  { value: 6, label: "Saturday", short: "Sa" },
];

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

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
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
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      // Format date in local timezone to match calendar format
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setEndDate(dateString);
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

  const renderDatePickers = () => (
    <View className="mb-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-base-content font-medium mb-2">Start Date</Text>
          <TouchableOpacity
            className="bg-base-200 rounded-lg p-3 flex-row items-center justify-between"
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text className="text-base-content">
              {new Date(
                new Date(startDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={new Date(startDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base-content font-medium mb-2">
            End Date (Optional)
          </Text>
          <TouchableOpacity
            className="bg-base-200 rounded-lg p-3 flex-row items-center justify-between"
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text className="text-base-content">
              {endDate
                ? new Date(
                    new Date(endDate).getTime() + 24 * 60 * 60 * 1000
                  ).toLocaleDateString()
                : "No end date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleEndDateChange}
              minimumDate={new Date(startDate)}
            />
          )}
          {recurrenceType !== "once" && !endDate && (
            <Text className="text-xs text-base-content/60 mt-1">
              Will default to end of {new Date().getFullYear()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderRecurrenceDropdown = () => (
    <View className="mb-4">
      <Text className="text-base-content font-medium mb-2">Repeat</Text>
      <TouchableOpacity
        className="bg-base-200 rounded-lg p-3 flex-row items-center justify-between"
        onPress={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
      >
        <Text className="text-base-content">
          {getRecurrenceDisplayText(recurrenceType, startDate)}
        </Text>
        <Ionicons
          name={showRecurrenceDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>

      {showRecurrenceDropdown && (
        <View className="mt-2 bg-base-100 rounded-lg border border-base-300">
          {getRecurrenceOptions(startDate).map((option) => (
            <TouchableOpacity
              key={option.type}
              className={`p-3 border-b border-base-300 last:border-b-0 ${
                recurrenceType === option.type
                  ? "bg-primary/10"
                  : "bg-transparent"
              }`}
              onPress={() => handleRecurrenceTypeChange(option.type)}
            >
              <Text
                className={`font-medium ${
                  recurrenceType === option.type
                    ? "text-primary"
                    : "text-base-content"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderMonthlyDateSelector = () => (
    <View className="mb-4">
      <Text className="text-base-content font-medium mb-2">Dates of Month</Text>
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
          <TouchableOpacity
            key={date}
            className={`w-10 h-10 rounded-lg border items-center justify-center ${
              selectedDates.includes(date)
                ? "bg-primary border-primary"
                : "bg-base-200 border-base-300"
            }`}
            onPress={() => handleDateToggle(date)}
          >
            <Text
              className={`text-sm font-medium ${
                selectedDates.includes(date)
                  ? "text-primary-content"
                  : "text-base-content"
              }`}
            >
              {date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
          {/* Workout Template Selection */}
          <View className="mb-6">
            <Text className="text-base-content font-medium mb-2">
              Select Workout Template
            </Text>
            {workoutTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                className={`p-3 rounded-lg border mb-2 ${
                  selectedWorkoutId === template.id
                    ? "bg-primary/10 border-primary"
                    : "bg-base-200 border-base-300"
                }`}
                onPress={() => setSelectedWorkoutId(template.id)}
              >
                <Text className="text-base-content font-medium">
                  {template.name}
                </Text>
                {template.description && (
                  <Text className="text-muted text-sm mt-1">
                    {template.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Selection */}
          {renderDatePickers()}

          {/* Recurrence Selection */}
          {renderRecurrenceDropdown()}

          {/* Conditional Selectors */}
          {recurrenceType === "monthly_date" && renderMonthlyDateSelector()}
        </ScrollView>
      </View>
    </Modal>
  );
}
