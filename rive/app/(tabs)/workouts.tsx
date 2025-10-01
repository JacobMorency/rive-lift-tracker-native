import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import WorkoutCard from "../components/workoutcard";
import AddWorkoutModal from "../components/addworkoutmodal";
import WorkoutTemplatesModal from "../components/workouttemplatesmodal";
import WorkoutDetailsModal from "../components/workoutdetailsmodal";

export default function WorkoutsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );
  const { user, userData } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const handleViewWorkoutDetails = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWorkoutId(null);
  };

  return (
    <View className="flex-1 bg-base-100">
      {/* Header */}
      <View
        className="bg-base-200 px-4 border-b border-base-300"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <Text className="text-2xl font-bold text-base-content">Workouts</Text>
        {userData && (
          <Text className="text-muted mt-1">
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
        onViewWorkoutDetails={handleViewWorkoutDetails}
      />

      <WorkoutDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        workoutId={selectedWorkoutId}
      />
    </View>
  );
}
