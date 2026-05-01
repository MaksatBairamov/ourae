import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { scale, verticalScale } from "../constants/layout";
import { colors, moodColors } from "../constants/theme";
import { getRecentCheckIns, type StoredCheckIn } from "../lib/db";

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

function getTrendLabel(avgEnergy: number, avgAnxiety: number) {
  if (avgAnxiety >= 8 && avgEnergy <= 3) return "High tension";
  if (avgAnxiety >= 7) return "Activated";
  if (avgEnergy <= 3) return "Low energy";
  if (avgEnergy >= 7 && avgAnxiety <= 4) return "Steady";
  return "Mixed";
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

  const stats = useMemo(() => {
    if (checkIns.length === 0) return null;

    const total = checkIns.length;

    const avgEnergy = Math.round(
      checkIns.reduce((sum, item) => sum + item.energy, 0) / total,
    );

    const avgAnxiety = Math.round(
      checkIns.reduce((sum, item) => sum + item.anxiety, 0) / total,
    );

    const moodCount: Record<string, number> = {};

    checkIns.forEach((item) => {
      const mood = item.mood || "Unknown";
      moodCount[mood] = (moodCount[mood] || 0) + 1;
    });

    const mostFrequentMood =
      Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Unknown";

    return {
      total,
      avgEnergy,
      avgAnxiety,
      mostFrequentMood,
      trend: getTrendLabel(avgEnergy, avgAnxiety),
    };
  }, [checkIns]);

  const handleStartCheckIn = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available.
    }

    router.push("/check-in");
  }, [isNavigating, router]);

  const handleBackHome = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available.
    }

    router.replace("/home");
  }, [isNavigating, router]);

  const mainColor = stats
    ? getMoodColor(stats.mostFrequentMood)
    : colors.primary;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View pointerEvents="none" style={styles.bgGlowWarm} />
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
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Current pattern</Text>

            <View style={styles.summaryTopRow}>
              <Text style={[styles.summaryTrend, { color: mainColor }]}>
                {stats.trend}
              </Text>

              <Text style={styles.totalText}>{stats.total} logs</Text>
            </View>

            <View style={styles.summaryMetaRow}>
              <Text style={styles.summaryMeta}>
                Energy {stats.avgEnergy}/10
              </Text>
              <View style={styles.metaDot} />
              <Text style={styles.summaryMeta}>
                Anxiety {stats.avgAnxiety}/10
              </Text>
              <View style={styles.metaDot} />
              <Text style={styles.summaryMeta} numberOfLines={1}>
                Often {stats.mostFrequentMood}
              </Text>
            </View>
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
              disabled={isNavigating}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isNavigating && styles.buttonDisabled,
              ]}
              onPress={handleStartCheckIn}
            >
              <Text style={styles.primaryButtonText}>Start check-in</Text>
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

                return (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: moodColor },
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

                      <Text style={styles.itemMeta}>
                        Energy {item.energy}/10 · Anxiety {item.anxiety}/10
                      </Text>

                      {item.note.trim().length > 0 ? (
                        <Text style={styles.itemNote} numberOfLines={2}>
                          “{item.note.trim()}”
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
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(32),
    backgroundColor: colors.bg,
  },
  bgGlowWarm: {
    position: "absolute",
    top: verticalScale(34),
    left: scale(-96),
    width: scale(230),
    height: scale(230),
    borderRadius: scale(115),
    backgroundColor: colors.warm,
    opacity: 0.15,
  },
  bgGlowMood: {
    position: "absolute",
    top: verticalScale(130),
    right: scale(-110),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    opacity: 0.1,
  },

  header: {
    marginBottom: verticalScale(30),
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
    letterSpacing: -1.2,
  },
  subtitle: {
    maxWidth: scale(310),
    color: colors.textMuted,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "600",
  },

  summaryBlock: {
    marginBottom: verticalScale(30),
  },
  summaryLabel: {
    marginBottom: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: scale(12),
    marginBottom: verticalScale(10),
  },
  summaryTrend: {
    flex: 1,
    fontSize: scale(42),
    lineHeight: verticalScale(48),
    fontWeight: "900",
    letterSpacing: -1.4,
  },
  totalText: {
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "800",
  },
  summaryMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: scale(8),
  },
  summaryMeta: {
    color: colors.textSoft,
    fontSize: scale(13),
    fontWeight: "800",
  },
  metaDot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: colors.textFaint,
    opacity: 0.45,
  },

  timelineBlock: {
    marginTop: verticalScale(2),
  },
  sectionTitle: {
    marginBottom: verticalScale(16),
    color: colors.text,
    fontSize: scale(22),
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  timeline: {
    gap: verticalScale(0),
  },
  timelineItem: {
    flexDirection: "row",
    gap: scale(13),
  },
  timelineLeft: {
    alignItems: "center",
    width: scale(16),
  },
  timelineDot: {
    width: scale(10),
    height: scale(10),
    marginTop: verticalScale(6),
    borderRadius: scale(5),
  },
  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: verticalScale(7),
    marginBottom: verticalScale(7),
    backgroundColor: colors.borderStrong,
    opacity: 0.65,
  },
  itemContent: {
    flex: 1,
    paddingBottom: verticalScale(22),
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
    marginBottom: verticalScale(4),
  },
  itemMood: {
    flex: 1,
    fontSize: scale(17),
    fontWeight: "900",
  },
  itemDate: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "700",
  },
  itemMeta: {
    marginBottom: verticalScale(6),
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "700",
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
  },
  emptyTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(24),
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  emptyText: {
    maxWidth: scale(300),
    marginBottom: verticalScale(20),
    color: colors.textMuted,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "600",
  },

  primaryButton: {
    alignItems: "center",
    paddingVertical: verticalScale(16),
    backgroundColor: colors.primary,
    borderRadius: scale(24),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(15),
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    marginTop: verticalScale(22),
    paddingVertical: verticalScale(16),
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
