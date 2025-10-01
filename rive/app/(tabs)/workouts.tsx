import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authcontext";
import { supabase } from "../lib/supabaseClient";
import WorkoutCard from "../components/workoutcard";
import AddWorkoutModal from "../components/addworkoutmodal";
import WorkoutTemplatesModal from "../components/workouttemplatesmodal";

export default function WorkoutsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const { user, userData } = useAuth();
  const router = useRouter();

  const handleAddNewWorkout = () => {
    setIsAddModalOpen(true);
  };

  const handleQuickStart = () => {
    // Navigate to sessions page to start a new session
    router.push("/(tabs)/sessions");
  };

  const handleWorkoutTemplates = () => {
    setIsTemplatesModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
      console.error("Logout error:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Workouts</Text>
        {userData && (
          <Text className="text-gray-600 mt-1">
            Welcome, {userData.first_name} {userData.last_name}!
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          <WorkoutCard
            title="Add New Workout"
            description="Start tracking your progress"
            icon="➕"
            onPress={handleAddNewWorkout}
            variant="primary"
          />

          <WorkoutCard
            title="Workout Templates"
            description="View and manage your saved workouts"
            icon="🏋️"
            onPress={handleWorkoutTemplates}
          />

          <WorkoutCard
            title="Quick Start Session"
            description="Start tracking your workout"
            icon="▶️"
            onPress={handleQuickStart}
          />
        </View>

        {/* Logout button at bottom */}
        <View className="mt-8">
          <TouchableOpacity
            className="w-full py-3 rounded-lg bg-red-500"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <AddWorkoutModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <WorkoutTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onAddNewWorkout={() => {
          setIsTemplatesModalOpen(false);
          setIsAddModalOpen(true);
        }}
      />
    </View>
  );
}
