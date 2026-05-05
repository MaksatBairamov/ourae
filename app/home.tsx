import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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
import { getRecentCheckIns, type StoredCheckIn } from "../lib/db";

function getMoodColor(mood: string) {
  return moodColors[mood as keyof typeof moodColors] || colors.primary;
}

function getTrendLabel(avgEnergy?: number, avgAnxiety?: number) {
  if (!avgEnergy || !avgAnxiety) return "No pattern yet";
  if (avgAnxiety >= 8 && avgEnergy <= 3) return "High tension";
  if (avgAnxiety >= 7) return "Activated";
  if (avgEnergy <= 3) return "Low energy";
  if (avgEnergy >= 7 && avgAnxiety <= 4) return "Steady";
  return "Mixed";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<StoredCheckIn[]>([]);

  const orbScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const data = await getRecentCheckIns();

      if (isMounted) {
        setCheckIns(data);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, {
          toValue: 1.12,
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

    animation.start();

    return () => animation.stop();
  }, [orbScale]);

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

  const lastMood = checkIns[0]?.mood || "No data yet";
  const moodColor = getMoodColor(lastMood);
  const recentCheckIns = checkIns.slice(0, 5);

  const handleCheckIn = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics may not be available.
    }

    router.push("/check-in");
  }, [router]);

  const handleOpenHistory = useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available.
    }

    router.push("/history");
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View pointerEvents="none" style={styles.bgGlowOne} />
        <View
          pointerEvents="none"
          style={[styles.bgGlowTwo, { backgroundColor: moodColor }]}
        />

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Animated.View
              style={[
                styles.logoMark,
                {
                  transform: [{ scale: orbScale }],
                },
              ]}
            >
              <View style={[styles.logoCore, { backgroundColor: moodColor }]} />
            </Animated.View>

            <View>
              <Text style={styles.title}>Ourae</Text>
              <Text style={styles.subtitle}>Emotional dashboard</Text>
            </View>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Current trend</Text>

          <Text style={[styles.heroValue, { color: moodColor }]}>
            {stats ? stats.trend : "No data yet"}
          </Text>

          <View style={styles.heroMetrics}>
            <Text style={styles.heroMetricText}>
              Energy {stats?.avgEnergy ?? "-"}/10
            </Text>

            <View style={styles.softDivider} />

            <Text style={styles.heroMetricText}>
              Anxiety {stats?.avgAnxiety ?? "-"}/10
            </Text>

            <View style={styles.softDivider} />

            <Text style={styles.heroMetricText}>{stats?.total ?? 0} logs</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start new check-in"
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: moodColor },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCheckIn}
        >
          <Text style={styles.primaryButtonText}>New check-in</Text>
        </Pressable>

        <View style={styles.shortcuts}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.shortcutItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleOpenHistory}
          >
            <Text style={styles.shortcutTitle}>Patterns</Text>
            <Text style={styles.shortcutText}>Full history</Text>
          </Pressable>

          <View style={styles.shortcutDivider} />

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.shortcutItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCheckIn}
          >
            <Text style={styles.shortcutTitle}>Reset</Text>
            <Text style={styles.shortcutText}>2 min check</Text>
          </Pressable>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Recent check-ins</Text>

          {checkIns.length > 0 ? (
            <Pressable onPress={handleOpenHistory}>
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          ) : null}
        </View>

        {recentCheckIns.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No check-ins yet</Text>
            <Text style={styles.emptyText}>
              Start with one short check-in. Patterns can wait, apparently.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {recentCheckIns.map((item) => {
              const mood = item.mood || "Unknown";
              const color = getMoodColor(mood);

              return (
                <View key={item.id} style={styles.historyItem}>
                  <View style={[styles.dot, { backgroundColor: color }]} />

                  <View style={styles.historyContent}>
                    <View style={styles.historyTopRow}>
                      <Text style={[styles.historyMood, { color }]}>
                        {mood}
                      </Text>

                      <Text style={styles.historyDate}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>

                    <Text style={styles.historyMeta}>
                      Energy {item.energy}/10 · Anxiety {item.anxiety}/10
                    </Text>

                    {item.note.trim().length > 0 ? (
                      <Text style={styles.historyNote} numberOfLines={1}>
                        “{item.note.trim()}”
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
            <View style={styles.footer}>
              <Pressable onPress={() => router.push("/legal/terms")}>
                <Text style={styles.footerLink}>Terms</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/legal/privacy")}>
                <Text style={styles.footerLink}>Privacy</Text>
              </Pressable>
            </View>
          </View>
        )}
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
    paddingBottom: verticalScale(36),
    backgroundColor: colors.bg,
  },
  bgGlowOne: {
    position: "absolute",
    top: verticalScale(20),
    left: scale(-110),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    backgroundColor: colors.warm,
    opacity: 0.24,
  },
  bgGlowTwo: {
    position: "absolute",
    top: verticalScale(96),
    right: scale(-120),
    width: scale(280),
    height: scale(280),
    borderRadius: scale(140),
    opacity: 0.18,
  },

  header: {
    marginBottom: verticalScale(38),
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMark: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(13),
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  logoCore: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
  },
  title: {
    color: colors.text,
    fontSize: scale(37),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    letterSpacing: -1.4,
  },
  subtitle: {
    marginTop: verticalScale(3),
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "700",
  },

  hero: {
    marginBottom: verticalScale(24),
  },
  heroLabel: {
    marginBottom: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroValue: {
    marginBottom: verticalScale(18),
    fontSize: scale(48),
    lineHeight: verticalScale(53),
    fontWeight: "900",
    letterSpacing: -1.7,
  },
  heroMetrics: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: scale(8),
  },
  heroMetricText: {
    color: colors.textSoft,
    fontSize: scale(13),
    fontWeight: "800",
  },
  softDivider: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: colors.textFaint,
    opacity: 0.45,
  },

  primaryButton: {
    alignItems: "center",
    marginBottom: verticalScale(28),
    paddingVertical: verticalScale(18),
    borderRadius: scale(28),
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(15),
    fontWeight: "900",
  },
  buttonPressed: {
    opacity: 0.76,
  },

  shortcuts: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(30),
    paddingVertical: verticalScale(4),
  },
  shortcutItem: {
    flex: 1,
    paddingVertical: verticalScale(8),
  },
  shortcutTitle: {
    marginBottom: verticalScale(3),
    color: colors.text,
    fontSize: scale(17),
    fontWeight: "900",
  },
  shortcutText: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "700",
  },
  shortcutDivider: {
    width: 1,
    height: verticalScale(34),
    marginHorizontal: scale(18),
    backgroundColor: colors.borderStrong,
    opacity: 0.7,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: scale(23),
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  viewAllText: {
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "900",
  },

  emptyBlock: {
    paddingTop: verticalScale(4),
  },
  emptyTitle: {
    marginBottom: verticalScale(6),
    color: colors.text,
    fontSize: scale(18),
    fontWeight: "900",
  },
  emptyText: {
    maxWidth: scale(270),
    color: colors.textMuted,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "600",
  },

  historyList: {
    gap: verticalScale(16),
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(12),
  },
  dot: {
    width: scale(9),
    height: scale(9),
    borderRadius: scale(4.5),
    marginTop: verticalScale(6),
  },
  historyContent: {
    flex: 1,
    paddingBottom: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(10),
  },
  historyMood: {
    flex: 1,
    fontSize: scale(16),
    fontWeight: "900",
  },
  historyDate: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "700",
  },
  historyMeta: {
    marginTop: verticalScale(3),
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },
  historyNote: {
    marginTop: verticalScale(5),
    color: colors.textSoft,
    fontSize: scale(12),
    lineHeight: verticalScale(17),
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(20),
    marginTop: verticalScale(40),
  },
  footerLink: {
    color: colors.textFaint,
    fontSize: scale(12),
    fontWeight: "700",
  },
});
