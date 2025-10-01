import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "../context/authcontext";

export default function SessionsPage() {
  const { userData } = useAuth();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Sessions</Text>
        {userData && (
          <Text className="text-gray-600 mt-1">
            Track your workout sessions
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          <View className="bg-white rounded-lg p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              📊 Session Tracking
            </Text>
            <Text className="text-gray-600">
              This is the sessions page. The session tracking functionality will
              be implemented next.
            </Text>
          </View>

          <View className="bg-white rounded-lg p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              🏋️ Quick Start
            </Text>
            <Text className="text-gray-600 mb-4">
              Start a new workout session to track your exercises and progress.
            </Text>
            <TouchableOpacity className="w-full py-3 rounded-lg bg-blue-500">
              <Text className="text-white text-center font-medium">
                Start New Session
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-lg p-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              📈 Recent Sessions
            </Text>
            <Text className="text-gray-600">
              Your recent workout sessions will appear here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
