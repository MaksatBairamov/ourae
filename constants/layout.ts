import { Dimensions } from "react-native";

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

function getScreen() {
  const { width, height } = Dimensions.get("window");
  return { width, height };
}

export function scale(size: number) {
  const { width } = getScreen();
  const factor = width / BASE_WIDTH;

  return Math.round(size * Math.min(Math.max(factor, 0.85), 1.25));
}

export function verticalScale(size: number) {
  const { height } = getScreen();
  const factor = height / BASE_HEIGHT;

  return Math.round(size * Math.min(Math.max(factor, 0.85), 1.25));
}

export function moderateScale(size: number, factor = 0.5) {
  const scaled = scale(size);
  return Math.round(size + (scaled - size) * factor);
}

const { width } = Dimensions.get("window");

export const isSmallScreen = width < 360;
export const isLargeScreen = width > 430;

export function getScreenFlags() {
  const { width: currentWidth } = getScreen();

  return {
    isSmallScreen: currentWidth < 360,
    isLargeScreen: currentWidth > 430,
  };
}
