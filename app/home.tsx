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

const RECENT_CHECK_INS_LIMIT = 4;

const HISTORY_ROUTE = "/history" as Href;
const CHECK_IN_ROUTE = "/check-in" as Href;
const VISUAL_CHECK_IN_ROUTE = "/visual-check-in" as Href;
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

function getVisualMood(item: StoredCheckIn) {
  const value = (item as StoredCheckIn & { visualMood?: string }).visualMood;

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

async function safeHaptic(type: "selection" | "lightImpact" = "selection") {
  try {
    if (type === "lightImpact") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    await Haptics.selectionAsync();
  } catch {
    // Haptics may not be available.
  }
}

export default function HomeScreen() {
  const router = useRouter();

  const [checkIns, setCheckIns] = useState<StoredCheckIn[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(14)).current;

  const loadCheckIns = useCallback(async () => {
    try {
      const data = await getRecentCheckIns();
      setCheckIns(data);
    } catch (error) {
      console.error("Failed to load check-ins:", error);
      setCheckIns([]);
    }
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
    router.push(CHECK_IN_ROUTE);
  }, [router]);

  const handleVisualCheckIn = useCallback(async () => {
    await safeHaptic("lightImpact");
    router.push(VISUAL_CHECK_IN_ROUTE);
  }, [router]);

  const handleOpenHistory = useCallback(async () => {
    await safeHaptic("selection");
    router.push(HISTORY_ROUTE);
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

            <View style={styles.statusCluster}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: moodColor,
                    shadowColor: moodColor,
                  },
                ]}
              />
              <Text style={styles.statusText}>{stats ? "Active" : "New"}</Text>
            </View>
          </View>

          <View style={styles.auraStage}>
            <View style={styles.auraWrap}>
              <AuraScene
                color={moodColor}
                energy={stats?.avgEnergy ?? 5}
                anxiety={stats?.avgAnxiety ?? 3}
              />
            </View>
          </View>

          <View style={styles.contentBlock}>
            <View style={styles.heroSection}>
              <View style={styles.heroHeader}>
                <Text style={styles.sectionLabel}>Current trend</Text>
                <Text style={styles.logCount}>
                  {stats ? `${stats.total} logs` : "No data"}
                </Text>
              </View>

              <Text style={[styles.heroValue, { color: moodColor }]}>
                {stats ? stats.trend : "No data yet"}
              </Text>

              <Text style={styles.heroSubtext}>
                {stats
                  ? `Most common mood: ${stats.mostFrequentMood}. Keep tracking gently, not obsessively. Revolutionary concept, apparently.`
                  : "Start with one short check-in to build your first emotional pattern."}
              </Text>

              <View style={styles.metricsLine}>
                <Metric
                  label="Energy"
                  value={`${stats?.avgEnergy ?? "-"}/10`}
                />
                <View style={styles.metricDivider} />
                <Metric
                  label="Anxiety"
                  value={`${stats?.avgAnxiety ?? "-"}/10`}
                />
                <View style={styles.metricDivider} />
                <Metric label="Logs" value={`${stats?.total ?? 0}`} />
              </View>
            </View>

            <View style={styles.actionSection}>
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

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start visual mood scan"
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleVisualCheckIn}
              >
                <Text style={styles.secondaryActionTitle}>
                  Visual mood scan
                </Text>
                <Text style={styles.secondaryActionText}>
                  Camera-based reflection
                </Text>
              </Pressable>
            </View>

            <View style={styles.linkRow}>
              <MinimalLink label="Patterns" onPress={handleOpenHistory} />
              <View style={styles.linkDivider} />
              <MinimalLink
                label="Weekly reflection"
                onPress={handleOpenWeeklyReflection}
              />
              <View style={styles.linkDivider} />
              <MinimalLink label="Reset" onPress={handleCheckIn} />
            </View>

            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Recent check-ins</Text>

              {checkIns.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all check-ins"
                  hitSlop={10}
                  onPress={handleOpenHistory}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                </Pressable>
              ) : null}
            </View>

            {recentCheckIns.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyTitle}>No check-ins yet</Text>
                <Text style={styles.emptyText}>
                  Add your first check-in and Ourae will start showing your
                  emotional rhythm here.
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {recentCheckIns.map((item) => {
                  const mood = item.mood || "Unknown";
                  const color = getMoodColor(mood);
                  const note = item.note?.trim();
                  const visualMood = getVisualMood(item);

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
                          styles.historyAccent,
                          { backgroundColor: color },
                        ]}
                      />

                      <View style={styles.historyContent}>
                        <View style={styles.historyTopRow}>
                          <Text
                            style={[styles.historyMood, { color }]}
                            numberOfLines={1}
                          >
                            {mood}
                          </Text>

                          <Text style={styles.historyDate}>
                            {formatDate(item.created_at)}
                          </Text>
                        </View>

                        <View style={styles.historyStatsRow}>
                          <Text style={styles.historyMeta}>
                            Energy {item.energy}/10
                          </Text>

                          <Text style={styles.historyMeta}>
                            Anxiety {item.anxiety}/10
                          </Text>
                        </View>

                        {visualMood ? (
                          <Text style={styles.historyVisualMeta}>
                            Visual scan: {visualMood}
                          </Text>
                        ) : null}

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

function MinimalLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      style={({ pressed }) => [pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <Text style={styles.minimalLinkText}>{label}</Text>
    </Pressable>
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
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(42),
    overflow: "visible",
  },

  bgGlow: {
    position: "absolute",
    top: verticalScale(118),
    right: scale(-130),
    width: scale(280),
    height: scale(280),
    borderRadius: scale(140),
    opacity: 0.12,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(10),
  },

  logo: {
    color: colors.text,
    fontSize: scale(31),
    lineHeight: verticalScale(36),
    fontWeight: "900",
    letterSpacing: -1.1,
  },

  status: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "700",
  },

  statusCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },

  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },

  statusText: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },

  auraStage: {
    width: "100%",
    height: isSmallScreen ? verticalScale(232) : verticalScale(260),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    marginBottom: verticalScale(2),
  },

  auraWrap: {
    position: "relative",
    width: "100%",
    height: isSmallScreen ? verticalScale(232) : verticalScale(260),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  contentBlock: {
    width: "100%",
  },

  heroSection: {
    marginBottom: verticalScale(26),
    paddingBottom: verticalScale(24),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  logCount: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },

  heroValue: {
    marginBottom: verticalScale(10),
    fontSize: isSmallScreen ? scale(39) : scale(45),
    lineHeight: isSmallScreen ? verticalScale(44) : verticalScale(50),
    fontWeight: "900",
    letterSpacing: -1.8,
  },

  heroSubtext: {
    maxWidth: scale(340),
    marginBottom: verticalScale(24),
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "700",
  },

  metricsLine: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(16),
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
    height: verticalScale(30),
    backgroundColor: colors.border,
  },

  actionSection: {
    gap: verticalScale(12),
    marginBottom: verticalScale(22),
  },

  primaryButton: {
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

  secondaryAction: {
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  secondaryActionTitle: {
    color: colors.text,
    fontSize: scale(15),
    fontWeight: "900",
  },

  secondaryActionText: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "700",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(16),
    marginBottom: verticalScale(26),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  minimalLinkText: {
    color: colors.textSoft,
    fontSize: scale(12),
    fontWeight: "900",
  },

  linkDivider: {
    width: 1,
    height: verticalScale(18),
    backgroundColor: colors.border,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(18),
  },

  sectionTitle: {
    color: colors.text,
    fontSize: scale(24),
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  viewAllText: {
    color: colors.cyan,
    fontSize: scale(13),
    fontWeight: "900",
  },

  emptyBlock: {
    paddingVertical: verticalScale(18),
    borderTopWidth: 1,
    borderBottomWidth: 1,
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
    gap: verticalScale(20),
  },

  historyItem: {
    flexDirection: "row",
    gap: scale(14),
    paddingBottom: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  historyItemPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },

  historyAccent: {
    width: scale(4),
    borderRadius: scale(999),
    opacity: 0.95,
  },

  historyContent: {
    flex: 1,
    minWidth: 0,
  },

  historyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: scale(14),
    marginBottom: verticalScale(7),
  },

  historyMood: {
    flex: 1,
    minWidth: 0,
    fontSize: scale(20),
    lineHeight: verticalScale(25),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  historyDate: {
    marginTop: verticalScale(3),
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },

  historyStatsRow: {
    flexDirection: "row",
    gap: scale(14),
    marginBottom: verticalScale(6),
  },

  historyMeta: {
    color: colors.textMuted,
    fontSize: scale(12),
    fontWeight: "800",
  },

  historyVisualMeta: {
    marginBottom: verticalScale(6),
    color: colors.cyan,
    fontSize: scale(12),
    fontWeight: "900",
  },

  historyNote: {
    color: colors.textSoft,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "600",
  },

  historyNoteMuted: {
    color: colors.textFaint,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "700",
    fontStyle: "italic",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(22),
    marginTop: verticalScale(38),
  },

  footerLink: {
    color: colors.textFaint,
    fontSize: scale(12),
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
