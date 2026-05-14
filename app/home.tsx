import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuraScene } from "../components/AuraScene";
import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
import { isSmallScreen, scale, verticalScale } from "../constants/layout";
import { colors, moodColors } from "../constants/theme";
import { getRecentCheckIns, type StoredCheckIn } from "../lib/db";
import { calculateEmotionStats } from "../lib/insights";

const ORBIT_LABEL = "Ourae";
const RECENT_CHECK_INS_LIMIT = 4;
const WEEKLY_REFLECTION_ROUTE = "/weekly-reflection" as Href;
function getMoodColor(mood: string) {
  return moodColors[mood as keyof typeof moodColors] || colors.primary;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

async function safeHaptic(type: "selection" | "lightImpact" = "selection") {
  try {
    if (type === "lightImpact") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    await Haptics.selectionAsync();
  } catch {
    // Haptics may not be available on every device/platform.
  }
}

function OrbitingBrand({ color }: { color: string }) {
  const rotate = useRef(new Animated.Value(0)).current;
  const letters = ORBIT_LABEL.split("");

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 24000,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [rotate]);

  return (
    <View pointerEvents="none" style={styles.orbitWrap}>
      {letters.map((letter, index) => {
        const baseAngle = (index / letters.length) * 360;

        const orbitRotate = rotate.interpolate({
          inputRange: [0, 1],
          outputRange: [`${baseAngle}deg`, `${baseAngle + 360}deg`],
        });

        const letterRotate = rotate.interpolate({
          inputRange: [0, 1],
          outputRange: [`${-baseAngle}deg`, `${-(baseAngle + 360)}deg`],
        });

        return (
          <Animated.View
            key={`${letter}-${index}`}
            style={[
              styles.orbitLetterWrap,
              {
                transform: [
                  { rotate: orbitRotate },
                  { translateY: -scale(84) },
                  { rotate: letterRotate },
                ],
              },
            ]}
          >
            <Text style={[styles.orbitLetter, { color }]}>{letter}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const [checkIns, setCheckIns] = useState<StoredCheckIn[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(14)).current;

  const loadCheckIns = useCallback(async () => {
    const data = await getRecentCheckIns();
    setCheckIns(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [loadCheckIns]),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(contentY, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeIn.stopAnimation();
      contentY.stopAnimation();
    };
  }, [contentY, fadeIn]);

  const stats = useMemo(() => calculateEmotionStats(checkIns), [checkIns]);

  const lastMood = checkIns[0]?.mood || "No data yet";
  const moodColor = getMoodColor(lastMood);
  const recentCheckIns = checkIns.slice(0, RECENT_CHECK_INS_LIMIT);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await loadCheckIns();
      await safeHaptic("selection");
    } finally {
      setIsRefreshing(false);
    }
  }, [loadCheckIns]);

  const handleCheckIn = useCallback(async () => {
    await safeHaptic("lightImpact");
    router.push("/check-in");
  }, [router]);

  const handleOpenHistory = useCallback(async () => {
    await safeHaptic("selection");
    router.push("/history");
  }, [router]);
  const handleOpenWeeklyReflection = useCallback(async () => {
    await safeHaptic("selection");
    router.push(WEEKLY_REFLECTION_ROUTE);
  }, [router]);
  const handleOpenTerms = useCallback(() => {
    router.push("/legal/terms");
  }, [router]);

  const handleOpenPrivacy = useCallback(() => {
    router.push("/legal/privacy");
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <BackgroundGradient />
      <GlowOrb />

      <Animated.View
        style={[
          styles.animatedRoot,
          {
            opacity: fadeIn,
            transform: [{ translateY: contentY }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces
          overScrollMode="never"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              tintColor={colors.cyan}
              colors={[colors.cyan]}
              progressBackgroundColor={colors.bgElevated}
              onRefresh={handleRefresh}
            />
          }
        >
          <View
            pointerEvents="none"
            style={[styles.bgGlow, { backgroundColor: moodColor }]}
          />

          <View style={styles.topBar}>
            <View>
              <Text style={styles.logo}>Ourae</Text>
              <Text style={styles.status}>Private emotional check-in</Text>
            </View>

            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: moodColor,
                    shadowColor: moodColor,
                  },
                ]}
              />
              <Text style={styles.statusPillText}>
                {stats ? "Active" : "New"}
              </Text>
            </View>
          </View>

          <View style={styles.auraStage}>
            <View style={styles.auraWrap}>
              <OrbitingBrand color={moodColor} />

              <AuraScene
                color={moodColor}
                energy={stats?.avgEnergy ?? 5}
                anxiety={stats?.avgAnxiety ?? 3}
              />
            </View>
          </View>

          <View style={styles.contentBlock}>
            <View
              style={[
                styles.heroCard,
                {
                  borderColor: stats ? moodColor : colors.border,
                  shadowColor: moodColor,
                },
              ]}
            >
              <View style={styles.heroTopRow}>
                <Text style={styles.heroLabel}>Current trend</Text>
                <Text style={styles.heroBadge}>
                  {stats ? `${stats.total} logs` : "No data"}
                </Text>
              </View>

              <Text style={[styles.heroValue, { color: moodColor }]}>
                {stats ? stats.trend : "No data yet"}
              </Text>

              <Text style={styles.heroSubtext}>
                {stats
                  ? `Most common mood: ${stats.mostFrequentMood}`
                  : "Start with one short check-in to build your first pattern."}
              </Text>

              <View style={styles.heroMetrics}>
                <View style={styles.metricPill}>
                  <Text style={styles.metricValue}>
                    {stats?.avgEnergy ?? "-"}
                  </Text>
                  <Text style={styles.metricLabel}>Energy</Text>
                </View>

                <View style={styles.metricPill}>
                  <Text style={styles.metricValue}>
                    {stats?.avgAnxiety ?? "-"}
                  </Text>
                  <Text style={styles.metricLabel}>Anxiety</Text>
                </View>

                <View style={styles.metricPill}>
                  <Text style={styles.metricValue}>{stats?.total ?? 0}</Text>
                  <Text style={styles.metricLabel}>Logs</Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start new check-in"
              style={({ pressed }) => [
                styles.primaryButton,
                { shadowColor: moodColor },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCheckIn}
            >
              <LinearGradient
                colors={[moodColor, colors.violetDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>New check-in</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.shortcuts}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open mood patterns history"
                style={({ pressed }) => [
                  styles.shortcutCard,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleOpenHistory}
              >
                <Text style={styles.shortcutTitle}>Patterns</Text>
                <Text style={styles.shortcutText}>View full history</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open weekly reflection"
                style={({ pressed }) => [
                  styles.shortcutCard,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleOpenWeeklyReflection}
              >
                <Text style={styles.shortcutTitle}>Week</Text>
                <Text style={styles.shortcutText}>Reflection</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start a quick emotional reset"
                style={({ pressed }) => [
                  styles.shortcutCard,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleCheckIn}
              >
                <Text style={styles.shortcutTitle}>Reset</Text>
                <Text style={styles.shortcutText}>2 min check-in</Text>
              </Pressable>
            </View>

            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Recent check-ins</Text>

              {checkIns.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all check-ins"
                  onPress={handleOpenHistory}
                  hitSlop={10}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                </Pressable>
              ) : null}
            </View>

            {recentCheckIns.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyTitle}>No check-ins yet</Text>
                <Text style={styles.emptyText}>
                  Add your first check-in. The app cannot detect patterns from
                  pure vibes, tragically.
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {recentCheckIns.map((item) => {
                  const mood = item.mood || "Unknown";
                  const color = getMoodColor(mood);
                  const note = item.note?.trim();

                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Open history entry for ${mood}`}
                      style={({ pressed }) => [
                        styles.historyItem,
                        pressed && styles.historyItemPressed,
                      ]}
                      onPress={handleOpenHistory}
                    >
                      <View
                        style={[
                          styles.dot,
                          {
                            backgroundColor: color,
                            shadowColor: color,
                          },
                        ]}
                      />

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

                        {note ? (
                          <Text style={styles.historyNote} numberOfLines={1}>
                            “{note}”
                          </Text>
                        ) : (
                          <Text style={styles.historyNoteMuted}>
                            No note added.
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open terms and conditions"
                onPress={handleOpenTerms}
              >
                <Text style={styles.footerLink}>Terms</Text>
              </Pressable>

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open privacy policy"
                onPress={handleOpenPrivacy}
              >
                <Text style={styles.footerLink}>Privacy</Text>
              </Pressable>
            </View>
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
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(42),
    overflow: "visible",
  },

  bgGlow: {
    position: "absolute",
    top: verticalScale(92),
    right: scale(-120),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    opacity: 0.13,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(24),
    marginBottom: verticalScale(4),
  },

  logo: {
    color: colors.text,
    fontSize: scale(29),
    lineHeight: verticalScale(34),
    fontWeight: "900",
    letterSpacing: -1,
  },

  status: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "700",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(7),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: scale(999),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statusDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(3.5),
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },

  statusPillText: {
    color: colors.textSoft,
    fontSize: scale(11),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  auraStage: {
    width: "100%",
    height: isSmallScreen ? verticalScale(245) : verticalScale(275),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    marginBottom: verticalScale(-6),
  },

  auraWrap: {
    position: "relative",
    width: "100%",
    height: isSmallScreen ? verticalScale(245) : verticalScale(275),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  orbitWrap: {
    position: "absolute",
    width: scale(194),
    height: scale(194),
    borderRadius: scale(97),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
    overflow: "visible",
  },

  orbitLetterWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  orbitLetter: {
    fontSize: scale(16),
    fontWeight: "900",
    letterSpacing: -0.35,
    opacity: 0.74,
    textShadowColor: "rgba(255,255,255,0.18)",
    textShadowRadius: 10,
  },

  contentBlock: {
    paddingHorizontal: scale(24),
  },

  heroCard: {
    marginBottom: verticalScale(18),
    padding: scale(20),
    borderRadius: scale(32),
    backgroundColor: colors.surface,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
    gap: scale(12),
  },

  heroLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  heroBadge: {
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "900",
  },

  heroValue: {
    marginBottom: verticalScale(9),
    fontSize: isSmallScreen ? scale(36) : scale(42),
    lineHeight: isSmallScreen ? verticalScale(42) : verticalScale(48),
    fontWeight: "900",
    letterSpacing: -1.6,
  },

  heroSubtext: {
    maxWidth: scale(285),
    marginBottom: verticalScale(18),
    color: colors.textMuted,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "700",
  },

  heroMetrics: {
    flexDirection: "row",
    gap: scale(10),
  },

  metricPill: {
    flex: 1,
    alignItems: "center",
    minHeight: verticalScale(70),
    justifyContent: "center",
    paddingVertical: verticalScale(10),
    borderRadius: scale(22),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  metricValue: {
    color: colors.text,
    fontSize: scale(20),
    fontWeight: "900",
  },

  metricLabel: {
    marginTop: verticalScale(2),
    color: colors.textMuted,
    fontSize: scale(10),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  primaryButton: {
    marginBottom: verticalScale(14),
    borderRadius: scale(28),
    overflow: "hidden",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  primaryButtonGradient: {
    alignItems: "center",
    paddingVertical: verticalScale(18),
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: scale(15),
    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  shortcuts: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: verticalScale(28),
  },

  shortcutCard: {
    flex: 1,
    minHeight: verticalScale(82),
    justifyContent: "center",
    padding: scale(16),
    borderRadius: scale(24),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  shortcutTitle: {
    marginBottom: verticalScale(4),
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "900",
  },

  shortcutText: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "700",
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },

  sectionTitle: {
    color: colors.text,
    fontSize: scale(22),
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  viewAllText: {
    color: colors.cyan,
    fontSize: scale(13),
    fontWeight: "900",
  },

  emptyBlock: {
    padding: scale(18),
    borderRadius: scale(24),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyTitle: {
    marginBottom: verticalScale(6),
    color: colors.text,
    fontSize: scale(18),
    fontWeight: "900",
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "600",
  },

  historyList: {
    gap: verticalScale(12),
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(12),
    padding: scale(15),
    borderRadius: scale(24),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  historyItemPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  dot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    marginTop: verticalScale(7),
    shadowOpacity: 0.75,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },

  historyContent: {
    flex: 1,
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

  historyNoteMuted: {
    marginTop: verticalScale(5),
    color: colors.textFaint,
    fontSize: scale(12),
    lineHeight: verticalScale(17),
    fontWeight: "700",
    fontStyle: "italic",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(20),
    marginTop: verticalScale(38),
  },

  footerLink: {
    color: colors.textFaint,
    fontSize: scale(12),
    fontWeight: "700",
  },
});
