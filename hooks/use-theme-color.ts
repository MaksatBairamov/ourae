/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ThemeColorProps = {
  light?: string;
  dark?: string;
};

type AppColorName = keyof typeof colors;

export function useThemeColor(props: ThemeColorProps, colorName: AppColorName) {
  const theme = useColorScheme() ?? "light";
  const resolvedTheme = theme === "dark" ? "dark" : "light";

  const colorFromProps = props[resolvedTheme];
  if (colorFromProps) {
    return colorFromProps;
  }

  return colors[colorName];
}
