import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
  { label: "Inhale", seconds: 4, scale: 1.22 },
  { label: "Hold", seconds: 7, scale: 1.22 },
  { label: "Exhale", seconds: 8, scale: 0.92 },
] as const;

const groundingSteps = [
  "Name 5 things you can see",
  "Touch 4 things around you",
  "Notice 3 sounds",
  "Find 2 smells",
  "Name 1 thing you appreciate",
];

export default function PanicScreen() {
  const router = useRouter();
  const [breathIndex, setBreathIndex] = useState(0);

  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.78)).current;

  const currentBreath = breathingSteps[breathIndex];

  const breathingHint = useMemo(() => {
    if (currentBreath.label === "Inhale") {
      return "Breathe in slowly through your nose.";
    }

    if (currentBreath.label === "Hold") {
      return "Hold gently. No force needed.";
    }

    return "Exhale longer than you inhale.";
  }, [currentBreath.label]);

  useEffect(() => {
    const duration = currentBreath.seconds * 1000;

    Animated.parallel([
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
    ]).start(({ finished }) => {
      if (finished) {
        setBreathIndex((prev) => (prev + 1) % breathingSteps.length);
      }
    });
  }, [
    breathIndex,
    circleOpacity,
    circleScale,
    currentBreath.scale,
    currentBreath.seconds,
  ]);

  const nextBreathStep = () => {
    setBreathIndex((prev) => (prev + 1) % breathingSteps.length);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glow} />

        <View style={styles.header}>
          <Text style={styles.kicker}>Support mode</Text>
          <Text style={styles.title}>Stay with this moment.</Text>
          <Text style={styles.subtitle}>
            You do not need to solve everything right now. First, help your body
            feel safer.
          </Text>
        </View>

        <Pressable style={styles.breathStage} onPress={nextBreathStep}>
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
          <Text style={styles.tapHint}>tap circle to skip step</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>Grounding</Text>
          <Text style={styles.sectionTitle}>Come back to the room.</Text>

          <View style={styles.stepsList}>
            {groundingSteps.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.safetyNote}>
          <Text style={styles.safetyText}>
            If you feel unsafe or at risk of harming yourself, contact local
            emergency support or someone you trust immediately.
          </Text>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/home" as any)}
        >
          <Text style={styles.primaryButtonText}>I feel a bit safer</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/check-in" as any)}
        >
          <Text style={styles.secondaryButtonText}>Check in again</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(28),
    backgroundColor: colors.bg,
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    top: verticalScale(78),
    alignSelf: "center",
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: colors.cyan,
    opacity: 0.1,
  },
  header: {
    marginBottom: verticalScale(30),
  },
  kicker: {
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: verticalScale(12),
  },
  title: {
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
    marginBottom: verticalScale(10),
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    textAlign: "center",
  },
  breathStage: {
    alignItems: "center",
    marginBottom: verticalScale(34),
    minHeight: verticalScale(250),
    justifyContent: "center",
  },
  breathRing: {
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.58)",
    backgroundColor: colors.cyanSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
  },
  breathLabel: {
    color: colors.text,
    fontSize: scale(30),
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  breathSeconds: {
    color: colors.cyan,
    fontSize: scale(42),
    fontWeight: "900",
    marginTop: verticalScale(4),
  },
  breathHint: {
    color: colors.textSoft,
    fontSize: scale(16),
    lineHeight: verticalScale(23),
    textAlign: "center",
    fontWeight: "700",
  },
  tapHint: {
    marginTop: verticalScale(8),
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionKicker: {
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: scale(23),
    lineHeight: verticalScale(29),
    fontWeight: "900",
    letterSpacing: -0.4,
    marginBottom: verticalScale(16),
  },
  stepsList: {
    gap: verticalScale(12),
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(14),
  },
  stepNumber: {
    width: scale(26),
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
  safetyNote: {
    borderLeftWidth: 2,
    borderLeftColor: colors.danger,
    paddingLeft: scale(14),
    marginBottom: verticalScale(22),
  },
  safetyText: {
    color: "#FECACA",
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: colors.cyan,
    borderRadius: scale(24),
    paddingVertical: verticalScale(17),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: verticalScale(12),
  },
  primaryButtonText: {
    color: "#05060D",
    fontSize: scale(16),
    fontWeight: "900",
  },
  secondaryButton: {
    borderRadius: scale(24),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },
});
