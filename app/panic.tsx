import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
import { scale, verticalScale } from "../constants/layout";
import { colors, shadows } from "../constants/theme";

const breathingSteps = [
  { label: "Inhale", seconds: 4, scale: 1.16 },
  { label: "Hold", seconds: 7, scale: 1.16 },
  { label: "Exhale", seconds: 8, scale: 0.9 },
] as const;

const supportPhases = [
  {
    label: "Breathe",
    title: "Slow the signal",
    text: "Start with one breath cycle. No fixing, no analyzing, just reduce the intensity first.",
  },
  {
    label: "Ground",
    title: "Return to the room",
    text: "Use your senses to reconnect with what is physically around you right now.",
  },
  {
    label: "Reconnect",
    title: "Do not stay alone with it",
    text: "If the feeling is too heavy, contact someone safe or use emergency support.",
  },
] as const;

const groundingSteps = [
  "5 things you can see",
  "4 things you can touch",
  "3 sounds you can hear",
  "2 things you can smell",
  "1 thing you appreciate",
];

const supportContacts = [
  { label: "Emergency", value: "112", description: "Immediate danger" },
  { label: "Ambulance", value: "144", description: "Medical emergency" },
  { label: "Emotional support", value: "143", description: "Dargebotene Hand" },
];

async function safeHaptic(
  type: "selection" | "medium" | "light" = "selection",
) {
  try {
    if (type === "medium") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }

    if (type === "light") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    await Haptics.selectionAsync();
  } catch {
    // Haptics may not be available.
  }
}

export default function PanicScreen() {
  const router = useRouter();

  const [breathIndex, setBreathIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.78)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(
    new Animated.Value(verticalScale(10)),
  ).current;

  const currentBreath = breathingSteps[breathIndex];
  const currentPhase = supportPhases[phaseIndex];

  const breathingHint = useMemo(() => {
    if (currentBreath.label === "Inhale") return "Slowly through your nose.";
    if (currentBreath.label === "Hold") return "Gently. No force.";
    return "Long and slow. Let go.";
  }, [currentBreath.label]);

  const progressWidth =
    `${((phaseIndex + 1) / supportPhases.length) * 100}%` as `${number}%`;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeIn.stopAnimation();
      contentTranslateY.stopAnimation();
    };
  }, [contentTranslateY, fadeIn]);

  useEffect(() => {
    const duration = currentBreath.seconds * 1000;

    animationRef.current?.stop();

    animationRef.current = Animated.parallel([
      Animated.timing(circleScale, {
        toValue: currentBreath.scale,
        duration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 0.72,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationRef.current.start(({ finished }) => {
      if (finished) {
        setBreathIndex((prev) => (prev + 1) % breathingSteps.length);
      }
    });

    return () => {
      animationRef.current?.stop();
      circleScale.stopAnimation();
      circleOpacity.stopAnimation();
    };
  }, [
    breathIndex,
    circleOpacity,
    circleScale,
    currentBreath.scale,
    currentBreath.seconds,
  ]);

  const nextBreathStep = useCallback(async () => {
    await safeHaptic();
    setBreathIndex((prev) => (prev + 1) % breathingSteps.length);
  }, []);

  const goToNextPhase = useCallback(async () => {
    await safeHaptic();

    setPhaseIndex((prev) => Math.min(prev + 1, supportPhases.length - 1));
  }, []);

  const goToPreviousPhase = useCallback(async () => {
    await safeHaptic();

    setPhaseIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleCall = useCallback(async (phoneNumber: string) => {
    await safeHaptic("medium");

    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.error("Could not open phone dialer:", error);
    }
  }, []);

  const goHome = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    await safeHaptic("light");

    router.replace("/home");
  }, [isNavigating, router]);

  const checkInAgain = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    await safeHaptic();

    router.replace("/check-in");
  }, [isNavigating, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <BackgroundGradient />
      <GlowOrb />

      <Animated.View
        style={[
          styles.animatedRoot,
          {
            opacity: fadeIn,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View pointerEvents="none" style={styles.glowCyan} />
          <View pointerEvents="none" style={styles.glowDanger} />

          <View style={styles.header}>
            <Text style={styles.kicker}>Support mode</Text>
            <Text style={styles.title}>Stay with this moment.</Text>
            <Text style={styles.subtitle}>
              Follow the steps slowly. The goal is not to solve your whole life
              in one screen, thankfully.
            </Text>
          </View>

          <View style={styles.phaseCard}>
            <View style={styles.phaseTopRow}>
              <Text style={styles.phaseKicker}>
                Step {phaseIndex + 1} of {supportPhases.length}
              </Text>
              <Text style={styles.phaseLabel}>{currentPhase.label}</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <Text style={styles.phaseTitle}>{currentPhase.title}</Text>
            <Text style={styles.phaseText}>{currentPhase.text}</Text>

            <View style={styles.phaseActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go to previous support step"
                disabled={phaseIndex === 0}
                style={({ pressed }) => [
                  styles.phaseButton,
                  phaseIndex === 0 && styles.phaseButtonDisabled,
                  pressed && styles.cardPressed,
                ]}
                onPress={goToPreviousPhase}
              >
                <Text style={styles.phaseButtonText}>Previous</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go to next support step"
                disabled={phaseIndex === supportPhases.length - 1}
                style={({ pressed }) => [
                  styles.phaseButtonPrimary,
                  phaseIndex === supportPhases.length - 1 &&
                    styles.phaseButtonDisabled,
                  pressed && styles.cardPressed,
                ]}
                onPress={goToNextPhase}
              >
                <Text style={styles.phaseButtonPrimaryText}>Next step</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Breathing step: ${currentBreath.label}. Tap to skip.`}
            style={({ pressed }) => [
              styles.breathCard,
              pressed && styles.cardPressed,
            ]}
            onPress={nextBreathStep}
          >
            <Animated.View
              style={[
                styles.breathRing,
                {
                  opacity: circleOpacity,
                  transform: [{ scale: circleScale }],
                },
              ]}
            >
              <View style={styles.breathInner}>
                <Text style={styles.breathLabel}>{currentBreath.label}</Text>
                <Text style={styles.breathSeconds}>
                  {currentBreath.seconds}s
                </Text>
              </View>
            </Animated.View>

            <Text style={styles.breathHint}>{breathingHint}</Text>
            <Text style={styles.tapHint}>tap to skip step</Text>
          </Pressable>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Grounding</Text>
            <Text style={styles.sectionTitle}>Come back to the room</Text>

            <View style={styles.stepsList}>
              {groundingSteps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepNumberBox}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.urgentBlock}>
            <Text style={styles.urgentTitle}>If you might hurt yourself</Text>
            <Text style={styles.urgentText}>
              Call emergency support now or contact someone you trust. This app
              is not a replacement for real human help.
            </Text>
          </View>

          <View style={styles.supportList}>
            {supportContacts.map((contact) => (
              <Pressable
                key={contact.value}
                accessibilityRole="button"
                accessibilityLabel={`Call ${contact.label}, ${contact.value}`}
                style={({ pressed }) => [
                  styles.supportRow,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => handleCall(contact.value)}
              >
                <View style={styles.supportTextBlock}>
                  <Text style={styles.supportLabel}>{contact.label}</Text>
                  <Text style={styles.supportDescription}>
                    {contact.description}
                  </Text>
                </View>

                <Text style={styles.supportNumber}>{contact.value}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back home"
              disabled={isNavigating}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                isNavigating && styles.buttonDisabled,
              ]}
              onPress={goHome}
            >
              <LinearGradient
                colors={[colors.cyan, colors.violetDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>I feel safer</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start another check-in"
              disabled={isNavigating}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
                isNavigating && styles.buttonDisabled,
              ]}
              onPress={checkInAgain}
            >
              <Text style={styles.secondaryButtonText}>Check in again</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  animatedRoot: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(32),
    overflow: "visible",
  },

  glowCyan: {
    position: "absolute",
    top: verticalScale(54),
    right: scale(-90),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: colors.cyan,
    opacity: 0.13,
  },

  glowDanger: {
    position: "absolute",
    bottom: verticalScale(180),
    left: scale(-120),
    width: scale(230),
    height: scale(230),
    borderRadius: scale(115),
    backgroundColor: colors.danger,
    opacity: 0.09,
  },

  header: {
    marginBottom: verticalScale(22),
  },

  kicker: {
    marginBottom: verticalScale(10),
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.7,
    textTransform: "uppercase",
  },

  title: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(38),
    lineHeight: verticalScale(43),
    fontWeight: "900",
    letterSpacing: -1.3,
  },

  subtitle: {
    maxWidth: scale(315),
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "700",
  },

  phaseCard: {
    marginBottom: verticalScale(22),
    padding: scale(18),
    backgroundColor: colors.surface,
    borderRadius: scale(30),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  phaseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
    marginBottom: verticalScale(12),
  },

  phaseKicker: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  phaseLabel: {
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  progressTrack: {
    height: verticalScale(7),
    marginBottom: verticalScale(16),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(999),
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.cyan,
    borderRadius: scale(999),
  },

  phaseTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(23),
    lineHeight: verticalScale(29),
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  phaseText: {
    marginBottom: verticalScale(16),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  phaseActions: {
    flexDirection: "row",
    gap: scale(10),
  },

  phaseButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: verticalScale(12),
    borderRadius: scale(18),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  phaseButtonPrimary: {
    flex: 1,
    alignItems: "center",
    paddingVertical: verticalScale(12),
    borderRadius: scale(18),
    backgroundColor: colors.cyanSoft,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.32)",
  },

  phaseButtonDisabled: {
    opacity: 0.42,
  },

  phaseButtonText: {
    color: colors.textSoft,
    fontSize: scale(13),
    fontWeight: "900",
  },

  phaseButtonPrimaryText: {
    color: colors.cyan,
    fontSize: scale(13),
    fontWeight: "900",
  },

  breathCard: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(30),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(22),
    backgroundColor: colors.surface,
    borderRadius: scale(34),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },

  cardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  breathRing: {
    width: scale(178),
    height: scale(178),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(22),
    backgroundColor: colors.cyanSoft,
    borderRadius: scale(89),
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.38)",
    shadowColor: colors.cyan,
    shadowOpacity: 0.24,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  breathInner: {
    width: scale(128),
    height: scale(128),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: scale(64),
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  breathLabel: {
    color: colors.text,
    fontSize: scale(28),
    lineHeight: verticalScale(33),
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  breathSeconds: {
    marginTop: verticalScale(4),
    color: colors.cyan,
    fontSize: scale(44),
    lineHeight: verticalScale(49),
    fontWeight: "900",
  },

  breathHint: {
    color: colors.textSoft,
    fontSize: scale(16),
    lineHeight: verticalScale(23),
    fontWeight: "700",
    textAlign: "center",
  },

  tapHint: {
    marginTop: verticalScale(7),
    color: colors.textFaint,
    fontSize: scale(10),
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  sectionCard: {
    marginBottom: verticalScale(22),
    padding: scale(18),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionLabel: {
    marginBottom: verticalScale(7),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  sectionTitle: {
    marginBottom: verticalScale(16),
    color: colors.text,
    fontSize: scale(24),
    lineHeight: verticalScale(30),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  stepsList: {
    gap: verticalScale(11),
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(13),
  },

  stepNumberBox: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: scale(14),
    backgroundColor: colors.cyanSoft,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.22)",
  },

  stepNumber: {
    color: colors.cyan,
    fontSize: scale(13),
    fontWeight: "900",
  },

  stepText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "700",
  },

  urgentBlock: {
    marginBottom: verticalScale(18),
    padding: scale(16),
    backgroundColor: colors.dangerSoft,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.26)",
  },

  urgentTitle: {
    marginBottom: verticalScale(6),
    color: colors.text,
    fontSize: scale(15),
    fontWeight: "900",
  },

  urgentText: {
    color: colors.textSoft,
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "700",
  },

  supportList: {
    marginBottom: verticalScale(24),
    gap: verticalScale(12),
  },

  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(14),
    padding: scale(16),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: colors.border,
  },

  supportTextBlock: {
    flex: 1,
  },

  supportLabel: {
    color: colors.text,
    fontSize: scale(15),
    fontWeight: "900",
  },

  supportDescription: {
    marginTop: verticalScale(3),
    color: colors.textMuted,
    fontSize: scale(12),
    lineHeight: verticalScale(17),
    fontWeight: "700",
  },

  supportNumber: {
    color: colors.cyan,
    fontSize: scale(26),
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  actions: {
    gap: verticalScale(12),
  },

  primaryButton: {
    borderRadius: scale(26),
    overflow: "hidden",
    shadowColor: colors.cyan,
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  primaryButtonGradient: {
    alignItems: "center",
    paddingVertical: verticalScale(17),
    borderRadius: scale(26),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  primaryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: scale(16),
    fontWeight: "900",
  },

  secondaryButton: {
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },

  secondaryButtonPressed: {
    opacity: 0.7,
  },

  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
