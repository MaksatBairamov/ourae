import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

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
          toValue: 1.1,
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
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeIn,
            transform: [{ translateY }],
          },
        ]}
      >
        <View pointerEvents="none" style={styles.glow} />

        <View style={styles.hero}>
          <Animated.View
            style={[styles.orbOuter, { transform: [{ scale: orbScale }] }]}
          >
            <View style={styles.orbInner} />
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

          <Text style={styles.disclaimerSmall}>
            If you feel unsafe, at risk of harming yourself, or in immediate
            danger, contact emergency services or a qualified professional.
          </Text>
        </View>

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
          <Text style={styles.buttonText}>I understand</Text>
        </Pressable>
        <View style={styles.linksRow}>
          <Pressable onPress={() => router.push("/legal/terms")}>
            <Text style={styles.link}>Terms</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/legal/privacy")}>
            <Text style={styles.link}>Privacy</Text>
          </Pressable>
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
    backgroundColor: colors.bg,
  },

  glow: {
    position: "absolute",
    top: verticalScale(74),
    alignSelf: "center",
    width: scale(290),
    height: scale(290),
    borderRadius: scale(145),
    backgroundColor: colors.lavender,
    opacity: 0.28,
  },

  hero: {
    alignItems: "center",
    marginTop: verticalScale(34),
  },
  orbOuter: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
    backgroundColor: colors.violetSoft,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  orbInner: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.primary,
  },

  title: {
    color: colors.text,
    fontSize: scale(44),
    lineHeight: verticalScale(49),
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
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    marginBottom: verticalScale(11),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },
  disclaimerSmall: {
    color: colors.textMuted,
    fontSize: scale(12),
    lineHeight: verticalScale(18),
    fontWeight: "700",
  },

  button: {
    alignItems: "center",
    paddingVertical: verticalScale(17),
    backgroundColor: colors.primary,
    borderRadius: scale(26),
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 11 },
    elevation: 7,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: scale(16),
    fontWeight: "900",
  },

  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(20),
    marginTop: verticalScale(12),
  },
  link: {
    color: colors.textFaint,
    fontSize: scale(13),
    fontWeight: "800",
  },
});
