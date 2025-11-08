import { RecurrenceType } from "../../lib/scheduleUtils";

export type WorkoutTemplate = {
  id: string;
  name: string;
  description: string | null;
};

export type ScheduleTypes = {
  RecurrenceType: RecurrenceType;
};

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Su" },
  { value: 1, label: "Monday", short: "M" },
  { value: 2, label: "Tuesday", short: "T" },
  { value: 3, label: "Wednesday", short: "W" },
  { value: 4, label: "Thursday", short: "Th" },
  { value: 5, label: "Friday", short: "F" },
  { value: 6, label: "Saturday", short: "Sa" },
];

// Helper function to parse YYYY-MM-DD date string as local date (not UTC)
// This prevents timezone issues where dates can appear a day behind
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getRecurrenceOptions = (
  startDate: string
): { type: RecurrenceType; label: string }[] => {
  const getWeeklyLabel = () => {
    if (!startDate) return "Weekly";
    const dayOfWeek = parseLocalDate(startDate).getDay();
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

export const getRecurrenceDisplayText = (
  type: RecurrenceType,
  startDate: string
): string => {
  const options = getRecurrenceOptions(startDate);
  return (
    options.find((option) => option.type === type)?.label || "Does not repeat"
  );
};

