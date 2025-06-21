import supabase from "../../lib/supabaseClient";
import { Dumbbell, Gift } from "lucide-react-native";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardCard from "./dashboardcard";
import Image from "expo-image";

const DashboardContent = () => {
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchTotalWorkouts = async (): Promise<void> => {
      if (user !== null) {
        const { data, error } = await supabase
          .from("workouts")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching workouts:", error.message);
        } else {
          setTotalWorkouts(data.length);
          setLoading(false);
        }
      }
    };

    fetchTotalWorkouts();
  }, [user]);

  return (
    <View>
      {!loading && (
        <View>
          <DashboardCard
            title={"Total Workouts"}
            description={"Your total amount of workouts."}
            content={totalWorkouts.toString()}
            icon={<Dumbbell stroke={"white"} />}
          />
        </View>
      )}
    </View>
  );
};
export default DashboardContent;
