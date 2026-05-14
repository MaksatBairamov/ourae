import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
import { scale, verticalScale } from "../constants/layout";
import { colors, moodColors, shadows } from "../constants/theme";
import { getRecentCheckIns, type StoredCheckIn } from "../lib/db";
import { generateWeeklyReflection } from "../lib/weekly-insights";

function getMoodColor(mood: string) {
  return moodColors[mood as keyof typeof moodColors] || colors.primary;
}

export default function WeeklyReflectionScreen() {
  const router = useRouter();

  const [checkIns, setCheckIns] = useState<StoredCheckIn[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const loadData = useCallback(async () => {
    const result = await getRecentCheckIns();
    setCheckIns(result);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const reflection = useMemo(
    () => generateWeeklyReflection(checkIns),
    [checkIns],
  );

  const mainColor = getMoodColor(reflection?.dominantMood || "Unknown");

  const handleBack = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not exist everywhere.
    }

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
          style={[
            styles.bgGlow,
            {
              backgroundColor: mainColor,
            },
          ]}
        />

        <View style={styles.header}>
          <Text style={styles.kicker}>Weekly reflection</Text>

          <Text style={styles.title}>Emotional rhythm</Text>

          <Text style={styles.subtitle}>
            Patterns matter more than one difficult moment.
          </Text>
        </View>

        {!reflection ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No weekly reflection yet</Text>

            <Text style={styles.emptyText}>
              Complete a few emotional check-ins first.
            </Text>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.summaryCard,
                {
                  borderColor: mainColor,
                  shadowColor: mainColor,
                },
              ]}
            >
              <Text style={styles.summaryLabel}>Overall reflection</Text>

              <Text
                style={[
                  styles.summaryMood,
                  {
                    color: mainColor,
                  },
                ]}
              >
                {reflection.dominantMood}
              </Text>

              <Text style={styles.summaryText}>{reflection.summary}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.smallCard}>
                <Text style={styles.smallLabel}>Avg energy</Text>

                <Text style={styles.smallValue}>
                  {reflection.averageEnergy}/10
                </Text>
              </View>

              <View style={styles.smallCard}>
                <Text style={styles.smallLabel}>Avg anxiety</Text>

                <Text style={styles.smallValue}>
                  {reflection.averageAnxiety}/10
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.smallCard}>
                <Text style={styles.smallLabel}>Hardest day</Text>

                <Text style={styles.smallValue}>
                  {reflection.difficultDay || "Unknown"}
                </Text>
              </View>

              <View style={styles.smallCard}>
                <Text style={styles.smallLabel}>Most stable</Text>

                <Text style={styles.smallValue}>
                  {reflection.stableDay || "Unknown"}
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Reflection</Text>

              <Text style={styles.insightText}>
                Emotional patterns are not permanent identities. A difficult
                week is information, not a verdict.
              </Text>
            </View>
          </>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={isNavigating}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            isNavigating && styles.buttonDisabled,
          ]}
          onPress={handleBack}
        >
          <LinearGradient
            colors={[mainColor, colors.violetDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Back home</Text>
          </LinearGradient>
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
    paddingBottom: verticalScale(36),
    overflow: "visible",
  },

  bgGlow: {
    position: "absolute",
    top: verticalScale(120),
    right: scale(-120),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    opacity: 0.12,
  },

  header: {
    marginBottom: verticalScale(28),
  },

  kicker: {
    marginBottom: verticalScale(10),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },

  title: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(40),
    lineHeight: verticalScale(45),
    fontWeight: "900",
    letterSpacing: -1.3,
  },

  subtitle: {
    maxWidth: scale(310),
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "700",
  },

  summaryCard: {
    marginBottom: verticalScale(20),
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(32),
    borderWidth: 1,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    elevation: 8,
  },

  summaryLabel: {
    marginBottom: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  summaryMood: {
    marginBottom: verticalScale(10),
    fontSize: scale(38),
    lineHeight: verticalScale(43),
    fontWeight: "900",
    letterSpacing: -1.4,
  },

  summaryText: {
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "700",
  },

  statsGrid: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: verticalScale(14),
  },

  smallCard: {
    flex: 1,
    minHeight: verticalScale(96),
    justifyContent: "center",
    padding: scale(16),
    borderRadius: scale(24),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  smallLabel: {
    marginBottom: verticalScale(6),
    color: colors.textMuted,
    fontSize: scale(10),
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  smallValue: {
    color: colors.text,
    fontSize: scale(20),
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  insightCard: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(26),
    padding: scale(18),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(26),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  insightLabel: {
    marginBottom: verticalScale(8),
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  insightText: {
    color: colors.textSoft,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "700",
  },

  emptyCard: {
    padding: scale(20),
    borderRadius: scale(28),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  emptyTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(22),
    fontWeight: "900",
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: scale(14),
    lineHeight: verticalScale(20),
    fontWeight: "700",
  },

  button: {
    borderRadius: scale(28),
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 8,
  },

  buttonGradient: {
    alignItems: "center",
    paddingVertical: verticalScale(18),
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  buttonText: {
    color: colors.white,
    fontSize: scale(15),
    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },
});
