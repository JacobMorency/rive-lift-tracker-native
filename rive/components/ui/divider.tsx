import { View, Text } from "react-native";

type DividerProps = {
  children?: React.ReactNode;
};

export default function Divider({ children }: DividerProps) {
  return (
    <View className="flex-row items-center justify-center my-4">
      <View className="flex-1 border-t border-gray" />
      {children && (
        <Text className="text-center text-primary-content px-3">
          {children}
        </Text>
      )}
      <View className="flex-1 border-t border-gray" />
    </View>
  );
}
