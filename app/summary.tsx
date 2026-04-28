import { useLocalSearchParams, useRouter } from "expo-router";
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
import { colors, moodColors } from "../constants/theme";
import { getEmotionalInsight, type EmotionalInsightResult } from "../lib/ai";

type Tone = {
  title: string;
  insight: string;
  action: string;
};

function getTone(energy: number, anxiety: number): Tone {
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

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const mood = typeof params.mood === "string" ? params.mood : "Not selected";
  const energy = typeof params.energy === "string" ? params.energy : "5";
  const anxiety = typeof params.anxiety === "string" ? params.anxiety : "3";
  const note = typeof params.note === "string" ? params.note : "";

  const energyNumber = Number.isFinite(Number(energy)) ? Number(energy) : 5;
  const anxietyNumber = Number.isFinite(Number(anxiety)) ? Number(anxiety) : 3;

  const moodColor =
    mood in moodColors
      ? moodColors[mood as keyof typeof moodColors]
      : colors.violet;

  const tone = useMemo(
    () => getTone(energyNumber, anxietyNumber),
    [energyNumber, anxietyNumber],
  );

  const [aiInsight, setAiInsight] = useState<EmotionalInsightResult | null>(
    null,
  );
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);

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

      const result = await getEmotionalInsight({
        mood,
        energy: energyNumber,
        anxiety: anxietyNumber,
        note,
      });

      if (isMounted) {
        setAiInsight(result);
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
    };
  }, [
    mood,
    energyNumber,
    anxietyNumber,
    note,
    insightOpacity,
    insightTranslateY,
    actionOpacity,
    actionTranslateY,
  ]);

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
          <View style={[styles.glowLarge, { backgroundColor: moodColor }]} />
          <View style={styles.glowWarm} />
          <View style={[styles.glowSmall, { backgroundColor: moodColor }]} />

          <View style={styles.header}>
            <Text style={styles.kicker}>Ourae summary</Text>
            <Text style={styles.title}>Check-in complete</Text>
            <Text style={styles.subtitle}>
              You paused long enough to name what is happening inside.
            </Text>
          </View>

          <View style={styles.moodStage}>
            <Text style={styles.stageLabel}>Current emotional signal</Text>

            <Text style={[styles.moodValue, { color: moodColor }]}>{mood}</Text>

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
          </Animated.View>

          <Pressable
            style={[styles.button, { backgroundColor: moodColor }]}
            onPress={() => router.push("/home" as any)}
          >
            <Text style={styles.buttonText}>Back to home</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/check-in" as any)}
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
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(28),
    backgroundColor: colors.bg,
    justifyContent: "center",
  },
  glowLarge: {
    position: "absolute",
    top: verticalScale(78),
    alignSelf: "center",
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    opacity: 0.18,
  },
  glowWarm: {
    position: "absolute",
    top: verticalScale(24),
    left: scale(-70),
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: colors.warm,
    opacity: 0.22,
  },
  glowSmall: {
    position: "absolute",
    bottom: verticalScale(70),
    right: scale(-80),
    width: scale(190),
    height: scale(190),
    borderRadius: scale(95),
    opacity: 0.14,
  },
  header: {
    marginBottom: verticalScale(32),
  },
  kicker: {
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.7,
    textTransform: "uppercase",
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  title: {
    fontSize: scale(32),
    lineHeight: verticalScale(38),
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginBottom: verticalScale(10),
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    color: colors.textMuted,
    textAlign: "center",
  },
  moodStage: {
    alignItems: "center",
    marginBottom: verticalScale(34),
  },
  stageLabel: {
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
  },
  moodValue: {
    fontSize: scale(48),
    lineHeight: verticalScale(54),
    fontWeight: "900",
    letterSpacing: -1.4,
    marginBottom: verticalScale(18),
  },
  metricsLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(24),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(22),
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricItem: {
    alignItems: "center",
    minWidth: scale(92),
  },
  metricValue: {
    color: colors.text,
    fontSize: scale(22),
    fontWeight: "900",
  },
  metricLabel: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metricDivider: {
    width: 1,
    height: verticalScale(34),
    backgroundColor: colors.borderStrong,
    marginHorizontal: scale(10),
  },
  insightSection: {
    marginBottom: verticalScale(24),
  },
  insightKicker: {
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: verticalScale(10),
  },
  insightTitle: {
    color: colors.text,
    fontSize: scale(23),
    lineHeight: verticalScale(29),
    fontWeight: "900",
    letterSpacing: -0.4,
    marginBottom: verticalScale(10),
  },
  insightText: {
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "600",
  },
  noteSection: {
    borderLeftWidth: 2,
    borderLeftColor: colors.borderStrong,
    paddingLeft: scale(16),
    marginBottom: verticalScale(24),
  },
  noteKicker: {
    color: colors.violetHot,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
  },
  noteText: {
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "600",
  },
  actionSection: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(24),
    padding: scale(18),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: verticalScale(22),
  },
  actionKicker: {
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
  },
  actionText: {
    color: colors.text,
    fontSize: scale(16),
    lineHeight: verticalScale(23),
    fontWeight: "800",
  },
  button: {
    borderRadius: scale(24),
    paddingVertical: verticalScale(17),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.56)",
    marginBottom: verticalScale(12),
  },
  buttonText: {
    color: "#171321",
    fontSize: scale(16),
    fontWeight: "900",
  },
  secondaryButton: {
    borderRadius: scale(24),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft,
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },
  skeletonTitle: {
    width: "68%",
    height: verticalScale(24),
    borderRadius: 999,
    backgroundColor: "rgba(23,19,33,0.13)",
    marginBottom: verticalScale(14),
  },
  skeletonLine: {
    width: "100%",
    height: verticalScale(14),
    borderRadius: 999,
    backgroundColor: "rgba(23,19,33,0.09)",
    marginBottom: verticalScale(10),
  },
  skeletonLineShort: {
    width: "76%",
  },
});
