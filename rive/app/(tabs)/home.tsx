import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardContent from "../../components/dashboard/dashboardcontent";
import { useAuth } from "../../hooks/useAuth";

export default function HomeScreen() {
  const { userData } = useAuth();
  return (
    <SafeAreaView className="bg-base-100 flex-1 px-4">
      <View>
        <Text className="text-primary-content text-3xl font-bold my-4">
          Dashboard
        </Text>
      </View>

      <View className="px-2">
        <View>
          <Text className="text-primary-content text-3xl font-bold my-4">
            Hiya, {userData?.first_name}!
          </Text>
        </View>
        <View>
          <DashboardContent />
        </View>
      </View>
    </SafeAreaView>
  );
}
