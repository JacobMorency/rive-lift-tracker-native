import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileCard from "../../components/profile/profilecard";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="bg-base-100 flex-1 px-4">
      <View>
        <Text className="text-primary-content text-3xl font-bold my-4">
          Profile
        </Text>
      </View>

      <View className="px-2">
        <ProfileCard />
      </View>
    </SafeAreaView>
  );
}
