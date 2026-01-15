import React from "react";
import { FlatList, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "./types";
import SessionCard from "./SessionCard";

type SessionListProps = {
  sessions: Session[];
  onSessionSelect: (sessionId: string) => void;
  ListHeaderComponent?: () => React.ReactElement;
  contentContainerStyle?: object;
};

export default function SessionList({
  sessions,
  onSessionSelect,
  ListHeaderComponent,
  contentContainerStyle,
}: SessionListProps) {
  const renderItem = ({ item }: { item: Session }) => (
    <View className="px-4 mb-4">
      <SessionCard
        session={item}
        onPress={() => onSessionSelect(item.id)}
      />
    </View>
  );

  const EmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-12 px-4">
      <View className="items-center">
        <View className="w-20 h-20 bg-gray-100 dark:bg-zinc-700 rounded-full items-center justify-center mb-4">
          <Ionicons name="fitness-outline" size={40} color="#9ca3af" />
        </View>
        <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          No Sessions Yet
        </Text>
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
          Ready to begin your fitness journey? Let's start with your first session!
        </Text>
        <View className="flex-row items-center gap-2">
          <Ionicons name="arrow-up" size={16} color="#ff4b8c" />
          <Text className="text-sm font-medium text-[#ff4b8c] dark:text-[#ff6fa1]">
            Tap "Start New Session" above
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={sessions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={EmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={[
        sessions.length === 0 ? { flexGrow: 1 } : {},
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

