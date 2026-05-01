import * as Haptics from "expo-haptics";
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

import { scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

const breathingSteps = [
  { label: "Inhale", seconds: 4, scale: 1.18 },
  { label: "Hold", seconds: 7, scale: 1.18 },
  { label: "Exhale", seconds: 8, scale: 0.9 },
] as const;

const groundingSteps = [
  "5 things you can see",
  "4 things you can touch",
  "3 sounds you can hear",
  "2 things you can smell",
  "1 thing you appreciate",
];

const supportContacts = [
  {
    label: "Emergency",
    value: "112",
    description: "Immediate danger",
  },
  {
    label: "Ambulance",
    value: "144",
    description: "Medical emergency",
  },
  {
    label: "Emotional support",
    value: "143",
    description: "Dargebotene Hand",
  },
];

export default function PanicScreen() {
  const router = useRouter();

  const [breathIndex, setBreathIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.78)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(
    new Animated.Value(verticalScale(10)),
  ).current;

  const currentBreath = breathingSteps[breathIndex];

  const breathingHint = useMemo(() => {
    if (currentBreath.label === "Inhale") {
      return "Slowly through your nose.";
    }

    if (currentBreath.label === "Hold") {
      return "Gently. No force.";
    }

    return "Long and slow. Let go.";
  }, [currentBreath.label]);

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
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available.
    }

    setBreathIndex((prev) => (prev + 1) % breathingSteps.length);
  }, []);

  const handleCall = useCallback(async (phoneNumber: string) => {
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.error("Could not open phone dialer:", error);
    }
  }, []);

  const goHome = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics may not be available.
    }

    router.replace("/home");
  }, [isNavigating, router]);

  const checkInAgain = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available.
    }

    router.replace("/check-in");
  }, [isNavigating, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
          <View pointerEvents="none" style={styles.glow} />

          <View style={styles.header}>
            <Text style={styles.kicker}>Support mode</Text>
            <Text style={styles.title}>Breathe first.</Text>
            <Text style={styles.subtitle}>
              You do not need to solve everything now.
            </Text>
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
              <Text style={styles.breathLabel}>{currentBreath.label}</Text>
              <Text style={styles.breathSeconds}>{currentBreath.seconds}s</Text>
            </Animated.View>

            <Text style={styles.breathHint}>{breathingHint}</Text>
            <Text style={styles.tapHint}>tap to skip step</Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Grounding</Text>
            <Text style={styles.sectionTitle}>Come back to the room</Text>

            <View style={styles.stepsList}>
              {groundingSteps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.urgentBlock}>
            <Text style={styles.urgentTitle}>If you might hurt yourself</Text>
            <Text style={styles.urgentText}>
              Call emergency support now or contact someone you trust.
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
              <Text style={styles.primaryButtonText}>I feel safer</Text>
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
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.bg,
  },
  glow: {
    position: "absolute",
    top: verticalScale(64),
    right: scale(-88),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: colors.cyan,
    opacity: 0.11,
  },

  header: {
    marginBottom: verticalScale(26),
  },
  kicker: {
    marginBottom: verticalScale(10),
    color: colors.textMuted,
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
    letterSpacing: -1.1,
  },
  subtitle: {
    maxWidth: scale(285),
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "600",
  },

  breathCard: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(30),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(20),
  },
  cardPressed: {
    opacity: 0.78,
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
    borderColor: "rgba(66,199,217,0.34)",
  },
  breathLabel: {
    color: colors.text,
    fontSize: scale(30),
    lineHeight: verticalScale(35),
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

  section: {
    marginBottom: verticalScale(26),
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
  stepNumber: {
    width: scale(24),
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
    paddingLeft: scale(14),
    borderLeftWidth: 2,
    borderLeftColor: colors.danger,
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
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    fontSize: scale(25),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  actions: {
    gap: verticalScale(11),
  },
  primaryButton: {
    alignItems: "center",
    paddingVertical: verticalScale(17),
    backgroundColor: colors.cyan,
    borderRadius: scale(24),
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: "#05060D",
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
