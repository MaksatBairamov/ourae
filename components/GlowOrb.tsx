import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

import { scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

export default function GlowOrb() {
  const floatY = useSharedValue(0);
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-18, {
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(12, {
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, {
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );

    rotate.value = withRepeat(
      withTiming(1, {
        duration: 28000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [floatY, pulse, rotate]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(rotate.value, [0, 1], [0, 360]);

    return {
      transform: [
        { translateY: floatY.value },
        { scale: pulse.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.orbWrap, animatedStyle]}>
        <LinearGradient
          colors={[
            "rgba(115,92,255,0.34)",
            "rgba(16,185,208,0.22)",
            "rgba(255,255,255,0.03)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />

        <BlurView intensity={80} tint="dark" style={styles.blur}>
          <View style={styles.innerGlow} />
          <View style={styles.highlight} />
        </BlurView>
      </Animated.View>

      <View style={styles.shadowGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: verticalScale(100),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },

  orbWrap: {
    width: scale(240),
    height: scale(240),
    borderRadius: scale(120),
    overflow: "hidden",

    shadowColor: colors.violet,
    shadowOpacity: 0.32,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: scale(120),
  },

  blur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: scale(120),

    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  innerGlow: {
    position: "absolute",
    width: "62%",
    height: "62%",
    borderRadius: 999,

    backgroundColor: "rgba(255,255,255,0.08)",
  },

  highlight: {
    position: "absolute",
    top: "16%",
    left: "18%",

    width: "32%",
    height: "20%",
    borderRadius: 999,

    backgroundColor: "rgba(255,255,255,0.18)",
    opacity: 0.9,
  },

  shadowGlow: {
    position: "absolute",
    width: scale(280),
    height: scale(280),
    borderRadius: 999,

    backgroundColor: "rgba(115,92,255,0.12)",
    opacity: 0.55,

    transform: [{ scale: 1.05 }],
  },
});
