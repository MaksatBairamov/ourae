import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
import { scale, verticalScale } from "../constants/layout";
import { colors, moodColors, shadows } from "../constants/theme";
import { getRecentCheckIns, type StoredCheckIn } from "../lib/db";
import { calculateEmotionStats } from "../lib/insights";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getMoodColor(mood: string) {
  return moodColors[mood as keyof typeof moodColors] || colors.primary;
}

function getVisualMood(item: StoredCheckIn) {
  return "visualMood" in item && typeof item.visualMood === "string"
    ? item.visualMood
    : null;
}

async function safeHaptic() {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Haptics may not be available.
  }
}

export default function HistoryScreen() {
  const router = useRouter();

  const [checkIns, setCheckIns] = useState<StoredCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCheckIns() {
      try {
        const result = await getRecentCheckIns();

        if (isMounted) {
          setCheckIns(result);
        }
      } catch (error) {
        console.error("Failed to load check-ins:", error);

        if (isMounted) {
          setCheckIns([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCheckIns();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => calculateEmotionStats(checkIns), [checkIns]);

  const mainColor = stats
    ? getMoodColor(stats.mostFrequentMood)
    : colors.primary;

  const handleStartCheckIn = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    await safeHaptic();

    router.push("/check-in");
  }, [isNavigating, router]);

  const handleBackHome = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    await safeHaptic();

    router.replace("/home");
  }, [isNavigating, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <BackgroundGradient />
      <GlowOrb />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View
          pointerEvents="none"
          style={[styles.backgroundGlow, { backgroundColor: mainColor }]}
        />

        <View style={styles.header}>
          <Text style={styles.kicker}>Patterns</Text>
          <Text style={styles.title}>Emotional history</Text>
          <Text style={styles.subtitle}>
            A calm overview of your recent check-ins and emotional direction.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateTitle}>Loading history</Text>
            <Text style={styles.stateText}>
              Preparing your recent emotional signals.
            </Text>
          </View>
        ) : null}

        {!isLoading && stats ? (
          <View style={styles.overviewSection}>
            <View style={styles.overviewHeader}>
              <Text style={styles.sectionLabel}>Current pattern</Text>
              <Text style={styles.logCount}>{stats.total} logs</Text>
            </View>

            <Text style={[styles.trendTitle, { color: mainColor }]}>
              {stats.trend}
            </Text>

            <Text style={styles.trendCopy}>{stats.patternCopy}</Text>

            <View style={styles.metricsLine}>
              <Metric label="Energy" value={`${stats.avgEnergy}/10`} />
              <View style={styles.metricDivider} />
              <Metric label="Anxiety" value={`${stats.avgAnxiety}/10`} />
              <View style={styles.metricDivider} />
              <Metric label="Often" value={stats.mostFrequentMood} />
            </View>

            {stats.lastSeven.length > 1 ? (
              <View style={styles.signalSection}>
                <Text style={styles.sectionLabel}>Last 7 signals</Text>

                <View style={styles.signalRow}>
                  {stats.lastSeven.map((item) => {
                    const moodColor = getMoodColor(item.mood || "Unknown");
                    const height = verticalScale(18 + item.anxiety * 5);

                    return (
                      <View key={item.id} style={styles.signalItem}>
                        <View
                          style={[
                            styles.signalBar,
                            {
                              height,
                              backgroundColor: moodColor,
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.signalHint}>
                  Higher bars indicate stronger anxiety intensity.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {!isLoading && checkIns.length === 0 ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateTitle}>No history yet</Text>
            <Text style={styles.stateText}>
              Complete a few check-ins and Ourae will start showing your
              emotional rhythm here.
            </Text>

            <PrimaryButton
              label="Start check-in"
              color={mainColor}
              disabled={isNavigating}
              onPress={handleStartCheckIn}
            />
          </View>
        ) : null}

        {!isLoading && checkIns.length > 0 ? (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent check-ins</Text>

            <View style={styles.historyList}>
              {checkIns.map((item) => {
                const mood = item.mood || "Unknown";
                const moodColor = getMoodColor(mood);
                const note = item.note?.trim();
                const visualMood = getVisualMood(item);

                return (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.itemAccentWrap}>
                      <View
                        style={[
                          styles.itemAccent,
                          { backgroundColor: moodColor },
                        ]}
                      />
                    </View>

                    <View style={styles.itemBody}>
                      <View style={styles.itemHeader}>
                        <Text
                          style={[styles.itemMood, { color: moodColor }]}
                          numberOfLines={1}
                        >
                          {mood}
                        </Text>

                        <Text style={styles.itemDate}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>

                      <View style={styles.itemStats}>
                        <Text style={styles.itemStat}>
                          Energy {item.energy}/10
                        </Text>

                        <Text style={styles.itemStat}>
                          Anxiety {item.anxiety}/10
                        </Text>
                      </View>

                      {visualMood ? (
                        <Text style={styles.visualText}>
                          Visual scan: {visualMood}
                        </Text>
                      ) : null}

                      {note ? (
                        <Text style={styles.noteText} numberOfLines={2}>
                          “{note}”
                        </Text>
                      ) : (
                        <Text style={styles.noteMuted}>No note added.</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          disabled={isNavigating}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
            isNavigating && styles.buttonDisabled,
          ]}
          onPress={handleBackHome}
        >
          <Text style={styles.backButtonText}>Back to home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  color,
  disabled,
  onPress,
}: {
  label: string;
  color: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        { shadowColor: color },
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[color, colors.violetDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryButtonGradient}
      >
        <Text style={styles.primaryButtonText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(34),
    paddingBottom: verticalScale(36),
  },

  backgroundGlow: {
    position: "absolute",
    top: verticalScale(128),
    right: scale(-120),
    width: scale(270),
    height: scale(270),
    borderRadius: scale(135),
    opacity: 0.11,
  },

  header: {
    marginBottom: verticalScale(34),
  },

  kicker: {
    marginBottom: verticalScale(10),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },

  title: {
    maxWidth: scale(340),
    marginBottom: verticalScale(10),
    color: colors.text,
    fontSize: scale(39),
    lineHeight: verticalScale(44),
    fontWeight: "900",
    letterSpacing: -1.4,
  },

  subtitle: {
    maxWidth: scale(330),
    color: colors.textMuted,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  overviewSection: {
    marginBottom: verticalScale(34),
    paddingBottom: verticalScale(26),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  logCount: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },

  trendTitle: {
    marginBottom: verticalScale(10),
    fontSize: scale(43),
    lineHeight: verticalScale(48),
    fontWeight: "900",
    letterSpacing: -1.8,
  },

  trendCopy: {
    marginBottom: verticalScale(24),
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "700",
  },

  metricsLine: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(18),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricValue: {
    color: colors.text,
    fontSize: scale(18),
    fontWeight: "900",
    letterSpacing: -0.4,
    textAlign: "center",
  },

  metricLabel: {
    marginTop: verticalScale(5),
    color: colors.textMuted,
    fontSize: scale(10),
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },

  metricDivider: {
    width: 1,
    height: verticalScale(32),
    backgroundColor: colors.border,
  },

  signalSection: {
    marginTop: verticalScale(24),
  },

  signalRow: {
    height: verticalScale(82),
    flexDirection: "row",
    alignItems: "flex-end",
    gap: scale(10),
    marginTop: verticalScale(14),
  },

  signalItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  signalBar: {
    width: "100%",
    maxWidth: scale(14),
    minHeight: verticalScale(12),
    borderRadius: scale(999),
    opacity: 0.86,
  },

  signalHint: {
    marginTop: verticalScale(12),
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "700",
  },

  historySection: {
    marginTop: verticalScale(2),
  },

  historyTitle: {
    marginBottom: verticalScale(18),
    color: colors.text,
    fontSize: scale(24),
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  historyList: {
    gap: verticalScale(22),
  },

  historyItem: {
    flexDirection: "row",
    gap: scale(14),
  },

  itemAccentWrap: {
    width: scale(14),
    alignItems: "center",
    paddingTop: verticalScale(6),
  },

  itemAccent: {
    width: scale(8),
    height: "100%",
    minHeight: verticalScale(92),
    borderRadius: scale(999),
    opacity: 0.9,
  },

  itemBody: {
    flex: 1,
    paddingBottom: verticalScale(22),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: scale(14),
    marginBottom: verticalScale(8),
  },

  itemMood: {
    flex: 1,
    fontSize: scale(22),
    lineHeight: verticalScale(27),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  itemDate: {
    marginTop: verticalScale(3),
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },

  itemStats: {
    flexDirection: "row",
    gap: scale(14),
    marginBottom: verticalScale(8),
  },

  itemStat: {
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "800",
  },

  visualText: {
    marginBottom: verticalScale(8),
    color: "#22D3EE",
    fontSize: scale(12),
    fontWeight: "900",
  },

  noteText: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "600",
  },

  noteMuted: {
    color: colors.textFaint,
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "700",
    fontStyle: "italic",
  },

  stateBlock: {
    padding: scale(22),
    backgroundColor: colors.surface,
    borderRadius: scale(30),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  stateTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(25),
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  stateText: {
    maxWidth: scale(310),
    marginBottom: verticalScale(22),
    color: colors.textMuted,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  primaryButton: {
    borderRadius: scale(26),
    overflow: "hidden",
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
    borderColor: "rgba(255,255,255,0.28)",
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: scale(15),
    fontWeight: "900",
  },

  backButton: {
    alignItems: "center",
    marginTop: verticalScale(30),
    paddingVertical: verticalScale(16),
  },

  backButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },
});
