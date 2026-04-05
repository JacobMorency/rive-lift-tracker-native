import React from "react";
import { Text, TextProps } from "react-native";

type AppTextVariant = "header" | "subheader" | "body" | "caption";
type AppTextTone = "default" | "muted" | "inverse" | "primary";

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
  className?: string;
};

const variantClasses: Record<AppTextVariant, string> = {
  header: "text-ds-header",
  subheader: "text-ds-subheader",
  body: "text-ds-body",
  caption: "text-ds-caption uppercase tracking-wider",
};

const toneClasses: Record<AppTextTone, string> = {
  default: "text-text dark:text-text-dark",
  muted: "text-textMuted dark:text-textMuted-dark",
  inverse: "text-white",
  primary: "text-primary dark:text-primary-dark",
};

export default function AppText({
  variant = "body",
  tone = "default",
  className = "",
  children,
  ...props
}: AppTextProps) {
  const resolvedClassName =
    `${variantClasses[variant]} ${toneClasses[tone]} ${className}`.trim();

  return (
    <Text className={resolvedClassName} {...props}>
      {children}
    </Text>
  );
}

