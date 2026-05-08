import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

type AuraSceneProps = {
  color: string;
  energy?: number;
  anxiety?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function AuraScene({ color, energy = 5, anxiety = 3 }: AuraSceneProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  const safeEnergy = clamp(energy, 1, 10);
  const safeAnxiety = clamp(anxiety, 1, 10);

  const config = useMemo(() => {
    const isHighAnxiety = safeAnxiety >= 7;

    return {
      coreSize: scale(68 + safeEnergy * 2.8),
      pulseTo: isHighAnxiety ? 1.13 : 1.07,
      pulseDuration: isHighAnxiety ? 1150 : 1900,
      driftDistance: isHighAnxiety ? verticalScale(4) : verticalScale(8),
      particleOpacity: isHighAnxiety ? 0.72 : 0.5,
    };
  }, [safeEnergy, safeAnxiety]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: config.pulseTo,
          duration: config.pulseDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: config.pulseDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const driftAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 4600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 4600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 26000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    driftAnimation.start();
    rotateAnimation.start();
    shimmerAnimation.start();

    return () => {
      pulseAnimation.stop();
      driftAnimation.stop();
      rotateAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [config.pulseDuration, config.pulseTo, drift, pulse, rotate, shimmer]);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -config.driftDistance],
  });

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.56],
  });

  const shimmerScale = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: color,
            opacity: shimmerOpacity,
            transform: [{ rotate: spin }, { scale: shimmerScale }],
          },
        ]}
      />

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
          styles.haloMedium,
          {
            backgroundColor: color,
            transform: [{ scale: pulse }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.haloSmall,
          {
            backgroundColor: color,
            transform: [{ scale: shimmerScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.core,
          {
            width: config.coreSize,
            height: config.coreSize,
            borderRadius: config.coreSize / 2,
            backgroundColor: color,
            shadowColor: color,
            transform: [{ scale: pulse }, { translateY }],
          },
        ]}
      >
        <View style={styles.coreHighlight} />
        <View style={styles.coreInnerShadow} />
      </Animated.View>

      <Animated.View
        style={[
          styles.particleLayer,
          {
            opacity: config.particleOpacity,
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View
          style={[styles.spark, styles.sparkOne, { backgroundColor: color }]}
        />
        <View
          style={[styles.spark, styles.sparkTwo, { backgroundColor: color }]}
        />
        <View
          style={[styles.spark, styles.sparkThree, { backgroundColor: color }]}
        />
        <View
          style={[styles.spark, styles.sparkFour, { backgroundColor: color }]}
        />
        <View
          style={[styles.spark, styles.sparkFive, { backgroundColor: color }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: verticalScale(210),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  outerRing: {
    position: "absolute",
    width: scale(198),
    height: scale(198),
    borderRadius: scale(99),
    borderWidth: 1,
    borderStyle: "dashed",
  },

  haloLarge: {
    position: "absolute",
    width: scale(190),
    height: scale(190),
    borderRadius: scale(95),
    opacity: 0.13,
  },

  haloMedium: {
    position: "absolute",
    width: scale(142),
    height: scale(142),
    borderRadius: scale(71),
    opacity: 0.17,
  },

  haloSmall: {
    position: "absolute",
    width: scale(92),
    height: scale(92),
    borderRadius: scale(46),
    opacity: 0.24,
  },

  core: {
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.95,
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
    overflow: "hidden",
  },

  coreHighlight: {
    position: "absolute",
    top: "14%",
    left: "18%",
    width: "38%",
    height: "30%",
    borderRadius: scale(999),
    backgroundColor: "rgba(255,255,255,0.26)",
    opacity: 0.7,
  },

  coreInnerShadow: {
    position: "absolute",
    right: "-14%",
    bottom: "-12%",
    width: "70%",
    height: "70%",
    borderRadius: scale(999),
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  particleLayer: {
    position: "absolute",
    width: scale(218),
    height: scale(218),
    borderRadius: scale(109),
  },

  spark: {
    position: "absolute",
    shadowColor: colors.white,
    shadowOpacity: 0.3,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  sparkOne: {
    top: verticalScale(30),
    right: scale(58),
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },

  sparkTwo: {
    left: scale(48),
    bottom: verticalScale(58),
    width: scale(4.5),
    height: scale(4.5),
    borderRadius: scale(2.25),
    opacity: 0.72,
  },

  sparkThree: {
    right: scale(38),
    bottom: verticalScale(82),
    width: scale(3.8),
    height: scale(3.8),
    borderRadius: scale(1.9),
    opacity: 0.58,
  },

  sparkFour: {
    top: verticalScale(82),
    left: scale(34),
    width: scale(3.5),
    height: scale(3.5),
    borderRadius: scale(1.75),
    opacity: 0.5,
  },

  sparkFive: {
    bottom: verticalScale(30),
    alignSelf: "center",
    width: scale(3.8),
    height: scale(3.8),
    borderRadius: scale(1.9),
    opacity: 0.42,
  },
});
