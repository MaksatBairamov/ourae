import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
import { scale, verticalScale } from "../constants/layout";
import { colors, shadows } from "../constants/theme";

const DISCLAIMER_ACCEPTED_KEY = "ourae.disclaimerAccepted";

export default function DisclaimerScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orbScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(orbScale, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    breathing.start();

    return () => {
      breathing.stop();
      fadeIn.stopAnimation();
      translateY.stopAnimation();
      orbScale.stopAnimation();
    };
  }, [fadeIn, orbScale, translateY]);

  const handleContinue = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await AsyncStorage.setItem(DISCLAIMER_ACCEPTED_KEY, "true");
      await Haptics.selectionAsync();
    } catch {
      // Even if storage or haptics fails, the user should still enter the app.
    }

    router.replace("/home");
  }, [isSubmitting, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <BackgroundGradient />
      <GlowOrb />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeIn,
            transform: [{ translateY }],
          },
        ]}
      >
        <View pointerEvents="none" style={styles.glowViolet} />
        <View pointerEvents="none" style={styles.glowCyan} />

        <View style={styles.hero}>
          <Animated.View
            style={[styles.orbOuter, { transform: [{ scale: orbScale }] }]}
          >
            <View style={styles.orbMiddle}>
              <View style={styles.orbInner} />
            </View>
          </Animated.View>

          <Text style={styles.title}>Ourae</Text>
          <Text style={styles.subtitle}>
            A quiet space to reflect on your emotions.
          </Text>
        </View>

        <View style={styles.disclaimerBlock}>
          <Text style={styles.disclaimerEyebrow}>Before you continue</Text>

          <Text style={styles.disclaimerTitle}>Reflection, not diagnosis.</Text>

          <Text style={styles.disclaimerText}>
            Ourae supports self-reflection and emotional awareness. It does not
            provide medical, psychological, or emergency advice.
          </Text>

          <View style={styles.safetyBox}>
            <Text style={styles.safetyTitle}>If you feel unsafe</Text>
            <Text style={styles.safetyText}>
              If you feel at risk of harming yourself or in immediate danger,
              contact emergency services or a qualified professional now.
            </Text>
          </View>
        </View>

        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Accept disclaimer and continue"
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={[colors.violet, colors.cyanDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Opening..." : "I understand"}
              </Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.linksRow}>
            <Pressable onPress={() => router.push("/legal/terms")}>
              <Text style={styles.link}>Terms</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/legal/privacy")}>
              <Text style={styles.link}>Privacy</Text>
            </Pressable>
          </View>
        </View>
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
    paddingTop: verticalScale(34),
    paddingBottom: verticalScale(30),
    justifyContent: "space-between",
    overflow: "hidden",
  },

  glowViolet: {
    position: "absolute",
    top: verticalScale(72),
    alignSelf: "center",
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    backgroundColor: colors.violet,
    opacity: 0.13,
  },

  glowCyan: {
    position: "absolute",
    bottom: verticalScale(180),
    right: scale(-120),
    width: scale(240),
    height: scale(240),
    borderRadius: scale(120),
    backgroundColor: colors.cyan,
    opacity: 0.1,
  },

  hero: {
    alignItems: "center",
    marginTop: verticalScale(34),
  },

  orbOuter: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
    backgroundColor: colors.violetSoft,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    shadowColor: colors.primary,
    shadowOpacity: 0.26,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  orbMiddle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.065)",
    borderWidth: 1,
    borderColor: colors.border,
  },

  orbInner: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: colors.violetHot,
    shadowColor: colors.violetHot,
    shadowOpacity: 0.7,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  title: {
    color: colors.text,
    fontSize: scale(46),
    lineHeight: verticalScale(51),
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  subtitle: {
    maxWidth: scale(280),
    marginTop: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "700",
    textAlign: "center",
  },

  disclaimerBlock: {
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(30),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },

  disclaimerEyebrow: {
    marginBottom: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  disclaimerTitle: {
    marginBottom: verticalScale(10),
    color: colors.text,
    fontSize: scale(25),
    lineHeight: verticalScale(31),
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  disclaimerText: {
    marginBottom: verticalScale(14),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  safetyBox: {
    padding: scale(15),
    backgroundColor: colors.dangerSoft,
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.26)",
  },

  safetyTitle: {
    marginBottom: verticalScale(5),
    color: colors.text,
    fontSize: scale(13),
    fontWeight: "900",
  },

  safetyText: {
    color: colors.textSoft,
    fontSize: scale(12),
    lineHeight: verticalScale(18),
    fontWeight: "700",
  },

  button: {
    borderRadius: scale(26),
    overflow: "hidden",
    shadowColor: colors.violet,
    shadowOpacity: 0.26,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  buttonGradient: {
    alignItems: "center",
    paddingVertical: verticalScale(17),
    borderRadius: scale(26),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: colors.white,
    fontSize: scale(16),
    fontWeight: "900",
  },

  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(20),
    marginTop: verticalScale(14),
  },

  link: {
    color: colors.textFaint,
    fontSize: scale(13),
    fontWeight: "800",
  },
});
