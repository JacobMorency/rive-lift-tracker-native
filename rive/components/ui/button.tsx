import { Text, Pressable } from "react-native";

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "error";
};

export default function Button({
  children,
  onPress,
  disabled = false,
  className = "",
  variant = "primary",
}: ButtonProps) {
  const baseStyle = "rounded-md px-4 py-2";

  const variantStyles = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    error: "bg-error",
  };

  const textColorStyles = {
    primary: "text-primary-content",
    secondary: "text-secondary-content",
    error: "text-error-content",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
    >
      <Text
        className={`${textColorStyles[variant]} text-center text-lg font-bold`}
      >
        {children}
      </Text>
    </Pressable>
  );
}
