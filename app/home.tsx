import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isSmallScreen, scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  const auraScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(auraScale, {
          toValue: 1.06,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(auraScale, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [auraScale, fadeIn]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/check-in" as any);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Animated.View style={[styles.container, { opacity: fadeIn }]}>
        <View style={styles.orbWarm} />
        <View style={styles.orbLavender} />
        <View style={styles.orbMint} />
        <View style={styles.orbPeach} />

        <View style={styles.brandBlock}>
          <Text style={styles.brand}>Ourae</Text>
        </View>

        <View style={styles.centerStage}>
          <Animated.View
            style={[styles.auraOuter, { transform: [{ scale: auraScale }] }]}
          >
            <View style={styles.auraMiddle}>
              <View style={styles.auraInner} />
            </View>
          </Animated.View>

          <Text style={styles.prompt}>Check in with yourself</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Start check-in</Text>
          </Pressable>
          <Pressable
            style={{ marginTop: verticalScale(14), alignItems: "center" }}
            onPress={() => router.push("/history" as any)}
          >
            <Text
              style={{
                color: colors.textSoft,
                fontSize: scale(14),
                fontWeight: "700",
              }}
            >
              View patterns
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.bg,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  brandBlock: {
    zIndex: 2,
  },
  brand: {
    color: colors.text,
    fontSize: isSmallScreen ? scale(46) : scale(52),
    lineHeight: isSmallScreen ? verticalScale(52) : verticalScale(58),
    fontWeight: "900",
    letterSpacing: -1.4,
  },
  centerStage: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    marginTop: verticalScale(-12),
  },
  auraOuter: {
    width: isSmallScreen ? scale(238) : scale(270),
    height: isSmallScreen ? scale(238) : scale(270),
    borderRadius: isSmallScreen ? scale(119) : scale(135),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(216,204,255,0.46)",
    borderWidth: 1,
    borderColor: "rgba(139,124,255,0.12)",
  },
  auraMiddle: {
    width: isSmallScreen ? scale(172) : scale(196),
    height: isSmallScreen ? scale(172) : scale(196),
    borderRadius: isSmallScreen ? scale(86) : scale(98),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(189,239,215,0.42)",
    borderWidth: 1,
    borderColor: "rgba(101,207,168,0.16)",
  },
  auraInner: {
    width: isSmallScreen ? scale(82) : scale(94),
    height: isSmallScreen ? scale(82) : scale(94),
    borderRadius: isSmallScreen ? scale(41) : scale(47),
    backgroundColor: colors.violet,
    opacity: 0.86,
    shadowColor: colors.violet,
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  prompt: {
    marginTop: verticalScale(32),
    color: colors.text,
    fontSize: isSmallScreen ? scale(25) : scale(29),
    lineHeight: isSmallScreen ? verticalScale(31) : verticalScale(35),
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  primaryButton: {
    zIndex: 2,
    backgroundColor: colors.violet,
    borderRadius: scale(28),
    paddingVertical: verticalScale(18),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: colors.violet,
    shadowOpacity: Platform.OS === "ios" ? 0.22 : 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(16),
    fontWeight: "900",
  },
  orbWarm: {
    position: "absolute",
    top: verticalScale(20),
    left: scale(-80),
    width: scale(285),
    height: scale(285),
    borderRadius: scale(142.5),
    backgroundColor: colors.warm,
    opacity: 0.34,
  },
  orbLavender: {
    position: "absolute",
    top: verticalScale(82),
    right: scale(-92),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: colors.lavender,
    opacity: 0.52,
  },
  orbMint: {
    position: "absolute",
    bottom: verticalScale(124),
    left: scale(-94),
    width: scale(230),
    height: scale(230),
    borderRadius: scale(115),
    backgroundColor: colors.mint,
    opacity: 0.38,
  },
  orbPeach: {
    position: "absolute",
    bottom: verticalScale(-72),
    right: scale(-46),
    width: scale(196),
    height: scale(196),
    borderRadius: scale(98),
    backgroundColor: colors.peach,
    opacity: 0.42,
  },
});
