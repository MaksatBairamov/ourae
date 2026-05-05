import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { scale, verticalScale } from "../constants/layout";

type AuraSceneProps = {
  color: string;
  energy?: number;
  anxiety?: number;
};

export function AuraScene({ color, energy = 5, anxiety = 3 }: AuraSceneProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;

  const pulseDuration = anxiety >= 7 ? 1300 : 1900;
  const coreSize = scale(82 + energy * 3);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: anxiety >= 7 ? 1.14 : 1.08,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
      ]),
    );

    const driftAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    driftAnimation.start();

    return () => {
      pulseAnimation.stop();
      driftAnimation.stop();
    };
  }, [anxiety, drift, pulse, pulseDuration]);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -verticalScale(8)],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.haloLarge,
          {
            backgroundColor: color,
            transform: [{ scale: pulse }, { translateY }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.haloSmall,
          {
            backgroundColor: color,
            transform: [{ scale: pulse }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.core,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
            backgroundColor: color,
            transform: [{ scale: pulse }, { translateY }],
          },
        ]}
      />

      <View style={[styles.sparkOne, { backgroundColor: color }]} />
      <View style={[styles.sparkTwo, { backgroundColor: color }]} />
      <View style={[styles.sparkThree, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: verticalScale(230),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  haloLarge: {
    position: "absolute",
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    opacity: 0.14,
  },
  haloSmall: {
    position: "absolute",
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    opacity: 0.18,
  },
  core: {
    opacity: 0.92,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  sparkOne: {
    position: "absolute",
    top: verticalScale(46),
    right: scale(92),
    width: scale(7),
    height: scale(7),
    borderRadius: scale(3.5),
    opacity: 0.72,
  },
  sparkTwo: {
    position: "absolute",
    left: scale(78),
    bottom: verticalScale(58),
    width: scale(5),
    height: scale(5),
    borderRadius: scale(2.5),
    opacity: 0.5,
  },
  sparkThree: {
    position: "absolute",
    right: scale(68),
    bottom: verticalScale(82),
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    opacity: 0.38,
  },
});
