import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { colors, moodColors } from "../constants/theme";
import { getEmotionalInsight, type EmotionalInsightResult } from "../lib/ai";

type Tone = {
  title: string;
  insight: string;
  action: string;
};

function clampScore(value: string, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(parsed), 1), 10);
}

function getMoodColor(mood: string) {
  return moodColors[mood as keyof typeof moodColors] || colors.violet;
}

function getTone(energy: number, anxiety: number): Tone {
  if (anxiety >= 8 && energy <= 3) {
    return {
      title: "Your body may need safety first.",
      insight:
        "High anxiety with low energy can feel intense and exhausting. You do not need to solve everything at once.",
      action: "Put both feet on the floor and take one slow exhale.",
    };
  }

  if (anxiety >= 8) {
    return {
      title: "Your system feels activated.",
      insight:
        "High anxiety usually means your body is trying to protect you, even when there is no immediate danger.",
      action: "Try one slow exhale before doing anything else.",
    };
  }

  if (energy <= 3) {
    return {
      title: "Your energy is asking for softness.",
      insight:
        "Low energy can make emotions feel heavier. A small reset may be more useful than forcing productivity.",
      action: "Drink water, sit down, or take a short quiet break.",
    };
  }

  return {
    title: "You created a moment of awareness.",
    insight:
      "Naming your state helps turn emotional noise into something you can actually understand.",
    action: "Come back later and check if the feeling changed.",
  };
}

function getStateLabel(energy: number, anxiety: number) {
  if (anxiety >= 8 && energy <= 3) return "High tension, low energy";
  if (anxiety >= 8) return "Activated";
  if (energy <= 3) return "Low energy";
  if (energy >= 7 && anxiety <= 4) return "Steady";
  if (energy >= 7 && anxiety >= 6) return "Charged";
  return "Mixed state";
}

function getPatternHint(mood: string, energy: number, anxiety: number) {
  if (anxiety >= 8 && energy <= 3) {
    return "This check-in suggests your nervous system may be overloaded. The useful move is not productivity. It is regulation first.";
  }

  if (anxiety >= 8) {
    return "Anxiety is the strongest signal here. Before deciding what this feeling means, give your body a moment to settle.";
  }

  if (energy <= 3) {
    return "Energy is the lowest signal here. Your next step should be small enough that it does not feel like another task.";
  }

  if (mood === "Happy" || mood === "Motivated") {
    return "This is a good moment to notice what supports you. Positive states are data too, not just emotional confetti.";
  }

  return "Nothing here needs to be fixed immediately. This is a snapshot, not a final verdict.";
}

function getMicroAction(energy: number, anxiety: number) {
  if (anxiety >= 8) return "Exhale slowly for 10 seconds.";
  if (energy <= 3) return "Drink water and sit somewhere quiet.";
  if (energy >= 7 && anxiety <= 4) return "Write down what helped today.";
  return "Name one thing you can control in the next 10 minutes.";
}

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const mood = typeof params.mood === "string" ? params.mood : "Not selected";
  const energyRaw = typeof params.energy === "string" ? params.energy : "5";
  const anxietyRaw = typeof params.anxiety === "string" ? params.anxiety : "3";
  const note = typeof params.note === "string" ? params.note.trim() : "";

  const energyNumber = clampScore(energyRaw, 5);
  const anxietyNumber = clampScore(anxietyRaw, 3);

  const moodColor = getMoodColor(mood);
  const tone = useMemo(
    () => getTone(energyNumber, anxietyNumber),
    [energyNumber, anxietyNumber],
  );

  const stateLabel = useMemo(
    () => getStateLabel(energyNumber, anxietyNumber),
    [energyNumber, anxietyNumber],
  );

  const patternHint = useMemo(
    () => getPatternHint(mood, energyNumber, anxietyNumber),
    [mood, energyNumber, anxietyNumber],
  );

  const microAction = useMemo(
    () => getMicroAction(energyNumber, anxietyNumber),
    [energyNumber, anxietyNumber],
  );

  const [aiInsight, setAiInsight] = useState<EmotionalInsightResult | null>(
    null,
  );
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(12)).current;
  const skeletonOpacity = useRef(new Animated.Value(0.35)).current;
  const insightOpacity = useRef(new Animated.Value(0)).current;
  const insightTranslateY = useRef(new Animated.Value(14)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;
  const actionTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateY, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      screenOpacity.stopAnimation();
      screenTranslateY.stopAnimation();
    };
  }, [screenOpacity, screenTranslateY]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 0.82,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.35,
          duration: 720,
          useNativeDriver: true,
        }),
      ]),
    );

    if (isLoadingInsight) {
      animation.start();
    }

    return () => animation.stop();
  }, [isLoadingInsight, skeletonOpacity]);

  useEffect(() => {
    let isMounted = true;

    async function loadInsight() {
      setIsLoadingInsight(true);

      try {
        const result = await getEmotionalInsight({
          mood,
          energy: energyNumber,
          anxiety: anxietyNumber,
          note,
        });

        if (!isMounted) return;

        setAiInsight(result);
      } catch (error) {
        console.error("Failed to load AI insight:", error);
        setAiInsight(tone);
      } finally {
        if (!isMounted) return;

        setIsLoadingInsight(false);

        Animated.sequence([
          Animated.parallel([
            Animated.timing(insightOpacity, {
              toValue: 1,
              duration: 480,
              useNativeDriver: true,
            }),
            Animated.timing(insightTranslateY, {
              toValue: 0,
              duration: 480,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(actionOpacity, {
              toValue: 1,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.timing(actionTranslateY, {
              toValue: 0,
              duration: 380,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }
    }

    loadInsight();

    return () => {
      isMounted = false;
      insightOpacity.stopAnimation();
      insightTranslateY.stopAnimation();
      actionOpacity.stopAnimation();
      actionTranslateY.stopAnimation();
    };
  }, [
    mood,
    energyNumber,
    anxietyNumber,
    note,
    tone,
    insightOpacity,
    insightTranslateY,
    actionOpacity,
    actionTranslateY,
  ]);

  const goHome = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available on every platform.
    }

    router.replace("/home");
  }, [isNavigating, router]);

  const checkInAgain = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics may not be available on every platform.
    }

    router.replace("/check-in");
  }, [isNavigating, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Animated.View
        style={[
          styles.animatedScreen,
          {
            opacity: screenOpacity,
            transform: [{ translateY: screenTranslateY }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View
            pointerEvents="none"
            style={[styles.glowLarge, { backgroundColor: moodColor }]}
          />
          <View pointerEvents="none" style={styles.glowWarm} />
          <View
            pointerEvents="none"
            style={[styles.glowSmall, { backgroundColor: moodColor }]}
          />

          <View style={styles.header}>
            <Text style={styles.kicker}>Ourae summary</Text>
            <Text style={styles.title}>Check-in complete</Text>
          </View>

          <View style={[styles.moodStage, { borderColor: moodColor }]}>
            <View style={[styles.moodAura, { backgroundColor: moodColor }]} />

            <Text style={styles.stageLabel}>Current emotional signal</Text>

            <Text style={[styles.moodValue, { color: moodColor }]}>{mood}</Text>

            <Text style={styles.subtitle}>
              You paused long enough to name what is happening inside.
            </Text>

            <View style={styles.statePill}>
              <View style={[styles.stateDot, { backgroundColor: moodColor }]} />
              <Text style={styles.statePillText}>{stateLabel}</Text>
            </View>

            <View style={styles.metricsLine}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{energyNumber}/10</Text>
                <Text style={styles.metricLabel}>energy</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{anxietyNumber}/10</Text>
                <Text style={styles.metricLabel}>anxiety</Text>
              </View>
            </View>
          </View>

          <View style={styles.patternCard}>
            <Text style={styles.patternKicker}>What this may mean</Text>
            <Text style={styles.patternText}>{patternHint}</Text>
          </View>

          <View style={styles.insightSection}>
            <Text style={styles.insightKicker}>AI reflection</Text>

            {isLoadingInsight ? (
              <Animated.View style={{ opacity: skeletonOpacity }}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
              </Animated.View>
            ) : (
              <Animated.View
                style={{
                  opacity: insightOpacity,
                  transform: [{ translateY: insightTranslateY }],
                }}
              >
                <Text style={styles.insightTitle}>
                  {aiInsight?.title || tone.title}
                </Text>
                <Text style={styles.insightText}>
                  {aiInsight?.insight || tone.insight}
                </Text>
              </Animated.View>
            )}
          </View>

          {note.length > 0 ? (
            <View style={styles.noteSection}>
              <Text style={styles.noteKicker}>What you wrote</Text>
              <Text style={styles.noteText}>“{note}”</Text>
            </View>
          ) : null}

          <Animated.View
            style={[
              styles.actionSection,
              {
                opacity: isLoadingInsight ? 0.45 : actionOpacity,
                transform: [{ translateY: actionTranslateY }],
              },
            ]}
          >
            <Text style={styles.actionKicker}>Tiny next step</Text>
            <Text style={styles.actionText}>
              {aiInsight?.action || tone.action}
            </Text>

            <View style={styles.microActionBox}>
              <Text style={styles.microActionLabel}>Even smaller</Text>
              <Text style={styles.microActionText}>{microAction}</Text>
            </View>
          </Animated.View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            disabled={isNavigating}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: moodColor },
              pressed && styles.buttonPressed,
              isNavigating && styles.buttonDisabled,
            ]}
            onPress={goHome}
          >
            <Text style={styles.buttonText}>Back to home</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start another check-in"
            disabled={isNavigating}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
              isNavigating && styles.buttonDisabled,
            ]}
            onPress={checkInAgain}
          >
            <Text style={styles.secondaryButtonText}>Check in again</Text>
          </Pressable>
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
  animatedScreen: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(34),
    backgroundColor: colors.bg,
  },

  glowLarge: {
    position: "absolute",
    top: verticalScale(70),
    alignSelf: "center",
    width: scale(320),
    height: scale(320),
    borderRadius: scale(160),
    opacity: 0.15,
  },
  glowWarm: {
    position: "absolute",
    top: verticalScale(14),
    left: scale(-88),
    width: scale(240),
    height: scale(240),
    borderRadius: scale(120),
    backgroundColor: colors.warm,
    opacity: 0.2,
  },
  glowSmall: {
    position: "absolute",
    bottom: verticalScale(52),
    right: scale(-92),
    width: scale(210),
    height: scale(210),
    borderRadius: scale(105),
    opacity: 0.12,
  },

  header: {
    marginBottom: verticalScale(20),
  },
  kicker: {
    marginBottom: verticalScale(10),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.7,
    textAlign: "center",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(39),
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },

  moodStage: {
    position: "relative",
    alignItems: "center",
    marginBottom: verticalScale(26),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(26),
    paddingBottom: verticalScale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(34),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  moodAura: {
    position: "absolute",
    top: verticalScale(-88),
    width: scale(230),
    height: scale(230),
    borderRadius: scale(115),
    opacity: 0.18,
  },
  stageLabel: {
    marginBottom: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  moodValue: {
    marginBottom: verticalScale(8),
    fontSize: scale(52),
    lineHeight: verticalScale(58),
    fontWeight: "900",
    letterSpacing: -1.8,
  },
  subtitle: {
    maxWidth: scale(285),
    marginBottom: verticalScale(18),
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "700",
    textAlign: "center",
  },

  statePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(7),
    marginBottom: verticalScale(17),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    backgroundColor: colors.surfaceElevated,
    borderRadius: scale(999),
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(3.5),
  },
  statePillText: {
    color: colors.textSoft,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  metricsLine: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(14),
    backgroundColor: colors.surfaceElevated,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    color: colors.text,
    fontSize: scale(23),
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  metricLabel: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  metricDivider: {
    width: 1,
    height: verticalScale(34),
    marginHorizontal: scale(10),
    backgroundColor: colors.borderStrong,
    opacity: 0.75,
  },

  patternCard: {
    marginBottom: verticalScale(22),
    paddingLeft: scale(16),
    borderLeftWidth: 2,
    borderLeftColor: colors.borderStrong,
  },
  patternKicker: {
    marginBottom: verticalScale(8),
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  patternText: {
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "700",
  },

  insightSection: {
    marginBottom: verticalScale(24),
  },
  insightKicker: {
    marginBottom: verticalScale(10),
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  insightTitle: {
    marginBottom: verticalScale(10),
    color: colors.text,
    fontSize: scale(24),
    lineHeight: verticalScale(30),
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  insightText: {
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "600",
  },

  noteSection: {
    marginBottom: verticalScale(24),
    paddingLeft: scale(16),
    borderLeftWidth: 2,
    borderLeftColor: colors.violetHot,
  },
  noteKicker: {
    marginBottom: verticalScale(8),
    color: colors.violetHot,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  noteText: {
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "600",
  },

  actionSection: {
    marginBottom: verticalScale(22),
    padding: scale(18),
    backgroundColor: colors.surface,
    borderRadius: scale(26),
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionKicker: {
    marginBottom: verticalScale(8),
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  actionText: {
    color: colors.text,
    fontSize: scale(16),
    lineHeight: verticalScale(23),
    fontWeight: "800",
  },

  microActionBox: {
    marginTop: verticalScale(14),
    padding: scale(15),
    backgroundColor: colors.violetSoft,
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: colors.border,
  },
  microActionLabel: {
    marginBottom: verticalScale(5),
    color: colors.textFaint,
    fontSize: scale(10),
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  microActionText: {
    color: colors.text,
    fontSize: scale(14),
    lineHeight: verticalScale(20),
    fontWeight: "800",
  },

  button: {
    alignItems: "center",
    marginBottom: verticalScale(12),
    paddingVertical: verticalScale(17),
    borderRadius: scale(26),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.56)",
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.76,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: scale(16),
    fontWeight: "900",
  },

  secondaryButton: {
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },

  skeletonTitle: {
    width: "68%",
    height: verticalScale(24),
    marginBottom: verticalScale(14),
    backgroundColor: "rgba(23,19,33,0.13)",
    borderRadius: 999,
  },
  skeletonLine: {
    width: "100%",
    height: verticalScale(14),
    marginBottom: verticalScale(10),
    backgroundColor: "rgba(23,19,33,0.09)",
    borderRadius: 999,
  },
  skeletonLineShort: {
    width: "76%",
  },
});
