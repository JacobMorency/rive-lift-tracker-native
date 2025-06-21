import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { House, Dumbbell, User } from "lucide-react-native";
export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading || user === undefined) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1b1b1b",
          borderTopWidth: 1,
          borderTopColor: "#2d2d2d",
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <House
              stroke={color}
              fill={focused ? color : "none"}
              className="size-[1.2em]"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, focused }) => (
            <Dumbbell
              stroke={color}
              fill={focused ? color : "none"}
              className="size-[1.2em]"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User
              stroke={color}
              fill={focused ? color : "none"}
              className="size-[1.2em]"
            />
          ),
        }}
      />
    </Tabs>
  );
}
