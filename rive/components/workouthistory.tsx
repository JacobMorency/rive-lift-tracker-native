"use client";
import WorkoutHistoryTab from "../components/workouthistory/workouthistorytab";
import supabase from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Workout } from "../types/workout";

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkoutHistory = async (): Promise<void> => {
      if (user !== null) {
        const { data, error } = await supabase
          .from("workouts")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_complete", true)
          .order("date", { ascending: false });

        if (error) {
          console.error("Error fetching workouts:", error.message);
        } else {
          setWorkouts(data);
        }
      }
    };

    fetchWorkoutHistory();
  }, [user]);
  return <WorkoutHistoryTab workouts={workouts} />;
};

export default WorkoutHistory;
