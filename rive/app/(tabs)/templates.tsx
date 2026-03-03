import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";
import Header from "../components/header";
import TemplatesSection from "../components/dashboard/TemplatesSection";

export default function TemplatesPage() {
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();

  const handleTemplateSelect = (templateId: string) => {
    // Templates can be used to start sessions, but this is optional
    // For now, just show the template details
    // This could be enhanced to start a session with the template
  };

  return (
    <View className="flex-1 bg-white dark:bg-zinc-900">
      <Header
        title="Templates"
        subtitle={
          userData
            ? `Manage your workout templates, ${userData.first_name}`
            : undefined
        }
      />

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TemplatesSection onTemplateSelect={handleTemplateSelect} />
      </ScrollView>
    </View>
  );
}
