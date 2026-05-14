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

  if (Number.isNaN(date.getTime())) return "recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getMoodColor(mood: string) {
  return moodColors[mood as keyof typeof moodColors] || colors.primary;
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
          style={[styles.bgGlowMood, { backgroundColor: mainColor }]}
        />

        <View style={styles.header}>
          <Text style={styles.kicker}>Patterns</Text>
          <Text style={styles.title}>Emotional traces</Text>
          <Text style={styles.subtitle}>
            Your recent check-ins, without turning one bad day into a life
            thesis.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>Loading patterns...</Text>
            <Text style={styles.emptyText}>
              Checking your recent emotional signals.
            </Text>
          </View>
        ) : null}

        {!isLoading && stats ? (
          <View
            style={[
              styles.summaryBlock,
              {
                borderColor: mainColor,
                shadowColor: mainColor,
              },
            ]}
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>Current pattern</Text>
              <Text style={styles.totalText}>{stats.total} logs</Text>
            </View>

            <Text style={[styles.summaryTrend, { color: mainColor }]}>
              {stats.trend}
            </Text>

            <Text style={styles.summaryCopy}>{stats.patternCopy}</Text>

            <View style={styles.summaryMetricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.avgEnergy}/10</Text>
                <Text style={styles.metricLabel}>Energy</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.avgAnxiety}/10</Text>
                <Text style={styles.metricLabel}>Anxiety</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue} numberOfLines={1}>
                  {stats.mostFrequentMood}
                </Text>
                <Text style={styles.metricLabel}>Often</Text>
              </View>
            </View>

            {stats.lastSeven.length > 1 ? (
              <View style={styles.miniTrendBlock}>
                <Text style={styles.miniTrendLabel}>Last 7 signals</Text>

                <View style={styles.miniTrendRow}>
                  {stats.lastSeven.map((item) => {
                    const moodColor = getMoodColor(item.mood || "Unknown");
                    const barHeight = verticalScale(18 + item.anxiety * 5);

                    return (
                      <View key={item.id} style={styles.miniTrendItem}>
                        <View
                          style={[
                            styles.miniTrendBar,
                            {
                              height: barHeight,
                              backgroundColor: moodColor,
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.miniTrendHint}>
                  Bar height reflects anxiety intensity.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {!isLoading && checkIns.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No patterns yet</Text>
            <Text style={styles.emptyText}>
              Complete a few check-ins and Ourae will start showing your
              emotional rhythm here.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start first check-in"
              disabled={isNavigating}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  shadowColor: mainColor,
                },
                pressed && styles.buttonPressed,
                isNavigating && styles.buttonDisabled,
              ]}
              onPress={handleStartCheckIn}
            >
              <LinearGradient
                colors={[mainColor, colors.violetDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Start check-in</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && checkIns.length > 0 ? (
          <View style={styles.timelineBlock}>
            <Text style={styles.sectionTitle}>Recent check-ins</Text>

            <View style={styles.timeline}>
              {checkIns.map((item, index) => {
                const mood = item.mood || "Unknown";
                const moodColor = getMoodColor(mood);
                const isLast = index === checkIns.length - 1;
                const note = item.note?.trim();

                return (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: moodColor,
                            shadowColor: moodColor,
                          },
                        ]}
                      />

                      {!isLast ? <View style={styles.timelineLine} /> : null}
                    </View>

                    <View style={styles.itemContent}>
                      <View style={styles.itemTopRow}>
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

                      <View style={styles.itemMetaRow}>
                        <Text style={styles.itemMeta}>
                          Energy {item.energy}/10
                        </Text>
                        <View style={styles.itemMetaDot} />
                        <Text style={styles.itemMeta}>
                          Anxiety {item.anxiety}/10
                        </Text>
                      </View>

                      {note ? (
                        <Text style={styles.itemNote} numberOfLines={2}>
                          “{note}”
                        </Text>
                      ) : (
                        <Text style={styles.itemNoteMuted}>No note added.</Text>
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
            styles.secondaryButton,
            pressed && styles.buttonPressed,
            isNavigating && styles.buttonDisabled,
          ]}
          onPress={handleBackHome}
        >
          <Text style={styles.secondaryButtonText}>Back to home</Text>
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
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(34),
    overflow: "visible",
  },

  bgGlowMood: {
    position: "absolute",
    top: verticalScale(120),
    right: scale(-118),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    opacity: 0.13,
  },

  header: {
    marginBottom: verticalScale(28),
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
    fontSize: scale(40),
    lineHeight: verticalScale(45),
    fontWeight: "900",
    letterSpacing: -1.4,
  },

  subtitle: {
    maxWidth: scale(315),
    color: colors.textMuted,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  summaryBlock: {
    marginBottom: verticalScale(30),
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(32),
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
  },

  summaryLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  totalText: {
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "900",
  },

  summaryTrend: {
    marginBottom: verticalScale(10),
    fontSize: scale(42),
    lineHeight: verticalScale(48),
    fontWeight: "900",
    letterSpacing: -1.7,
  },

  summaryCopy: {
    marginBottom: verticalScale(18),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  summaryMetricGrid: {
    flexDirection: "row",
    gap: scale(10),
  },

  metricCard: {
    flex: 1,
    minHeight: verticalScale(74),
    justifyContent: "center",
    paddingHorizontal: scale(9),
    paddingVertical: verticalScale(10),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: colors.border,
  },

  metricValue: {
    color: colors.text,
    fontSize: scale(17),
    fontWeight: "900",
    letterSpacing: -0.3,
    textAlign: "center",
  },

  metricLabel: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(10),
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    textAlign: "center",
  },

  miniTrendBlock: {
    marginTop: verticalScale(18),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  miniTrendLabel: {
    marginBottom: verticalScale(12),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  miniTrendRow: {
    height: verticalScale(78),
    flexDirection: "row",
    alignItems: "flex-end",
    gap: scale(8),
  },

  miniTrendItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  miniTrendBar: {
    width: "100%",
    maxWidth: scale(18),
    minHeight: verticalScale(12),
    borderRadius: scale(999),
    opacity: 0.82,
  },

  miniTrendHint: {
    marginTop: verticalScale(10),
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "700",
  },

  timelineBlock: {
    marginTop: verticalScale(2),
  },

  sectionTitle: {
    marginBottom: verticalScale(18),
    color: colors.text,
    fontSize: scale(23),
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  timeline: {
    gap: verticalScale(0),
  },

  timelineItem: {
    flexDirection: "row",
    gap: scale(14),
  },

  timelineLeft: {
    alignItems: "center",
    width: scale(16),
  },

  timelineDot: {
    width: scale(11),
    height: scale(11),
    marginTop: verticalScale(18),
    borderRadius: scale(5.5),
    shadowOpacity: 0.75,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },

  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: verticalScale(7),
    marginBottom: verticalScale(8),
    backgroundColor: colors.borderStrong,
    opacity: 0.65,
  },

  itemContent: {
    flex: 1,
    marginBottom: verticalScale(14),
    padding: scale(16),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: colors.border,
  },

  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
    marginBottom: verticalScale(4),
  },

  itemMood: {
    flex: 1,
    fontSize: scale(18),
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  itemDate: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },

  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: scale(7),
    marginBottom: verticalScale(7),
  },

  itemMeta: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },

  itemMetaDot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: colors.textFaint,
    opacity: 0.65,
  },

  itemNote: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(20),
    fontWeight: "600",
  },

  itemNoteMuted: {
    color: colors.textFaint,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "700",
    fontStyle: "italic",
  },

  emptyBlock: {
    marginTop: verticalScale(12),
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(30),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  emptyTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(25),
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  emptyText: {
    maxWidth: scale(300),
    marginBottom: verticalScale(20),
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
    borderColor: "rgba(255,255,255,0.3)",
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: scale(15),
    fontWeight: "900",
  },

  secondaryButton: {
    alignItems: "center",
    marginTop: verticalScale(24),
    paddingVertical: verticalScale(16),
  },

  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },
});
