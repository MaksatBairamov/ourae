import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const scale = (size: number) => Math.round((width / 375) * size);
export const verticalScale = (size: number) =>
  Math.round((height / 812) * size);

export const isSmallScreen = width < 360;
export const isLargeScreen = width > 430;
