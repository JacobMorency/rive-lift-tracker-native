import { useColorScheme } from "react-native";

/**
 * Icon tint for top bars using `bg-chrome` (light: white) / `chrome-dark` (dark: black).
 * Matches design tokens `text` (#111113) and `text-dark` (#f5f5f5).
 */
export function useChromeIconTint(): string {
  const scheme = useColorScheme();
  return scheme === "dark" ? "#f5f5f5" : "#111113";
}
