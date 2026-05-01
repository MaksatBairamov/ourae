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
    paddingBottom: verticalScale(28),
    justifyContent: "space-between",
    backgroundColor: colors.bg,
  },
  glow: {
    position: "absolute",
    top: verticalScale(82),
    alignSelf: "center",
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    backgroundColor: colors.lavender,
    opacity: 0.22,
  },
  hero: {
    alignItems: "center",
    marginTop: verticalScale(34),
  },
  orbOuter: {
    width: scale(86),
    height: scale(86),
    borderRadius: scale(43),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.violetSoft,
    marginBottom: verticalScale(22),
  },
  orbInner: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.primary,
  },
  title: {
    color: colors.text,
    fontSize: scale(42),
    lineHeight: verticalScale(47),
    fontWeight: "900",
    letterSpacing: -1.3,
  },
  subtitle: {
    maxWidth: scale(270),
    marginTop: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "600",
    textAlign: "center",
  },
  disclaimerBlock: {
    padding: scale(20),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: scale(24),
    lineHeight: verticalScale(30),
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  disclaimerText: {
    marginBottom: verticalScale(10),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },
  disclaimerSmall: {
    color: colors.textMuted,
    fontSize: scale(12),
    lineHeight: verticalScale(18),
    fontWeight: "600",
  },
  button: {
    alignItems: "center",
    paddingVertical: verticalScale(17),
    backgroundColor: colors.primary,
    borderRadius: scale(24),
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: scale(16),
    fontWeight: "900",
  },
  linksRow: {
    flexDirection: "row",
    gap: scale(16),
    marginTop: verticalScale(10),
  },

  link: {
    color: colors.primary,
    fontSize: scale(13),
    fontWeight: "800",
  },
});
