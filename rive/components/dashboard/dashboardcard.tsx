import { View, Text } from "react-native";

type DashboardCardProps = {
  title: string;
  content: string;
  description: string;
  icon?: React.ReactNode;
};

const DashboardCard = ({
  title,
  content,
  description,
  icon,
}: DashboardCardProps) => {
  return (
    <View>
      <View className="bg-primary rounded-lg p-6 shadow-lg">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-primary-content text-xl font-bold">
            {title}
          </Text>
          {icon && (
            <Text className="w-5 h-5 flex items-center justify-center">
              {icon}
            </Text>
          )}
        </View>
        <Text className="text-primary-content text-3xl font-medium mb-1">
          {content}
        </Text>
        <Text className="text-primary-content text-sm">{description}</Text>
      </View>
    </View>
  );
};

export default DashboardCard;
