import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale } from "../constants/layout";
import { colors, moodColors } from "../constants/theme";
import { getRecentCheckIns, type StoredCheckIn } from "../lib/db";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<StoredCheckIn[]>([]);

  useEffect(() => {
    setCheckIns(getRecentCheckIns());
  }, []);

  const stats = useMemo(() => {
    if (checkIns.length === 0) return null;

    const total = checkIns.length;

    const avgAnxiety = Math.round(
      checkIns.reduce((sum, item) => sum + item.anxiety, 0) / total,
    );

    const avgEnergy = Math.round(
      checkIns.reduce((sum, item) => sum + item.energy, 0) / total,
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
      avgAnxiety,
      avgEnergy,
      mostFrequentMood,
    };
  }, [checkIns]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glowWarm} />
        <View style={styles.glowMint} />

        <View style={styles.header}>
          <Text style={styles.kicker}>Ourae patterns</Text>
          <Text style={styles.title}>Your emotional traces</Text>
          <Text style={styles.subtitle}>
            A quiet look at your recent check-ins.
          </Text>
        </View>

        {stats ? (
          <View style={styles.statsBlock}>
            <View>
              <Text style={styles.statsNumber}>{stats.total}</Text>
              <Text style={styles.statsLabel}>check-ins</Text>
            </View>

            <View style={styles.statsDivider} />

            <View>
              <Text
                style={[
                  styles.statsNumber,
                  {
                    color:
                      moodColors[
                        stats.mostFrequentMood as keyof typeof moodColors
                      ] || colors.violet,
                  },
                ]}
              >
                {stats.mostFrequentMood}
              </Text>
              <Text style={styles.statsLabel}>most common</Text>
            </View>
          </View>
        ) : null}

        {stats ? (
          <View style={styles.miniStats}>
            <Text style={styles.miniStatText}>
              Energy avg {stats.avgEnergy}/10
            </Text>
            <Text style={styles.miniStatText}>
              Anxiety avg {stats.avgAnxiety}/10
            </Text>
          </View>
        ) : null}

        {checkIns.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No patterns yet.</Text>
            <Text style={styles.emptyText}>
              Complete a few check-ins and Ourae will start showing your recent
              emotional signals here.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/check-in" as any)}
            >
              <Text style={styles.primaryButtonText}>Start check-in</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.timeline}>
            {checkIns.map((item) => {
              const mood = item.mood || "Unknown";
              const moodColor =
                moodColors[mood as keyof typeof moodColors] || colors.violet;

              return (
                <View key={item.id} style={styles.timelineItem}>
                  <View style={[styles.dot, { backgroundColor: moodColor }]} />

                  <View style={styles.timelineContent}>
                    <View style={styles.itemTopRow}>
                      <Text style={[styles.itemMood, { color: moodColor }]}>
                        {mood}
                      </Text>
                      <Text style={styles.itemDate}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>

                    <Text style={styles.itemMeta}>
                      Energy {item.energy}/10 · Anxiety {item.anxiety}/10
                    </Text>

                    {item.note ? (
                      <Text style={styles.itemNote} numberOfLines={2}>
                        “{item.note}”
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/home" as any)}
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
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.bg,
  },
  glowWarm: {
    position: "absolute",
    top: verticalScale(20),
    left: scale(-80),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: colors.warm,
    opacity: 0.28,
  },
  glowMint: {
    position: "absolute",
    bottom: verticalScale(140),
    right: scale(-90),
    width: scale(230),
    height: scale(230),
    borderRadius: scale(115),
    backgroundColor: colors.mint,
    opacity: 0.32,
  },
  header: {
    marginBottom: verticalScale(28),
  },
  kicker: {
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.7,
    textTransform: "uppercase",
    marginBottom: verticalScale(12),
  },
  title: {
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    letterSpacing: -0.9,
    marginBottom: verticalScale(10),
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
  },
  statsBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(28),
    padding: scale(20),
    marginBottom: verticalScale(14),
  },
  statsNumber: {
    color: colors.text,
    fontSize: scale(28),
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  statsLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: verticalScale(4),
  },
  statsDivider: {
    width: 1,
    height: verticalScale(44),
    backgroundColor: colors.borderStrong,
    marginHorizontal: scale(22),
  },
  miniStats: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(26),
  },
  miniStatText: {
    color: colors.textSoft,
    fontSize: scale(13),
    fontWeight: "800",
  },
  emptyState: {
    marginTop: verticalScale(40),
  },
  emptyTitle: {
    color: colors.text,
    fontSize: scale(24),
    fontWeight: "900",
    marginBottom: verticalScale(8),
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    marginBottom: verticalScale(22),
  },
  timeline: {
    gap: verticalScale(18),
  },
  timelineItem: {
    flexDirection: "row",
    gap: scale(14),
  },
  dot: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    marginTop: verticalScale(6),
  },
  timelineContent: {
    flex: 1,
    paddingBottom: verticalScale(18),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
    marginBottom: verticalScale(4),
  },
  itemMood: {
    fontSize: scale(18),
    fontWeight: "900",
  },
  itemDate: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "700",
    marginBottom: verticalScale(6),
  },
  itemNote: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.violet,
    borderRadius: scale(24),
    paddingVertical: verticalScale(17),
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(16),
    fontWeight: "900",
  },
  secondaryButton: {
    marginTop: verticalScale(28),
    borderRadius: scale(24),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: scale(15),
    fontWeight: "900",
  },
});
