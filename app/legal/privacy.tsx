import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "../../components/BackgroundGradient";
import GlowOrb from "../../components/GlowOrb";
import { scale, verticalScale } from "../../constants/layout";
import { colors, shadows } from "../../constants/theme";
import { clearAllCheckIns } from "../../lib/db";

export default function PrivacyScreen() {
  const router = useRouter();

  const [isClearing, setIsClearing] = useState(false);
  const [hasCleared, setHasCleared] = useState(false);

  const handleClearData = async () => {
    if (isClearing) return;

    setIsClearing(true);

    try {
      await clearAllCheckIns();
      await Haptics.selectionAsync();
      setHasCleared(true);
    } catch (error) {
      console.error("Failed to clear data:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleBack = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available.
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <BackgroundGradient />
      <GlowOrb />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View pointerEvents="none" style={styles.glowCyan} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.kicker}>Ourae privacy</Text>
        <Text style={styles.title}>Privacy Policy</Text>

        <View style={styles.heroCard}>
          <Text style={styles.cardTitle}>Your saved data stays local.</Text>
          <Text style={styles.cardText}>
            Your check-ins are stored on this device. In this version, Ourae
            does not use an external database for saved entries.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What is stored</Text>
          <Text style={styles.text}>
            Ourae stores your mood, energy, anxiety, note, and check-in time
            locally on your device.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AI reflection</Text>
          <Text style={styles.text}>
            If AI reflection is used, your check-in content may be sent to a
            third-party AI provider for processing. Do not enter information you
            do not want to share.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Not medical care</Text>
          <Text style={styles.warningText}>
            Ourae is not a medical service and does not provide diagnosis,
            treatment, therapy, or emergency support.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear my local check-in data"
          disabled={isClearing}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.buttonPressed,
            isClearing && styles.buttonDisabled,
          ]}
          onPress={handleClearData}
        >
          <LinearGradient
            colors={[colors.danger, colors.dangerDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.clearButtonGradient}
          >
            <Text style={styles.clearButtonText}>
              {isClearing ? "Clearing..." : "Clear my data"}
            </Text>
          </LinearGradient>
        </Pressable>

        {hasCleared ? (
          <Text style={styles.successText}>
            Local check-ins have been deleted.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(36),
    overflow: "visible",
  },

  glowCyan: {
    position: "absolute",
    top: verticalScale(120),
    right: scale(-120),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: colors.cyan,
    opacity: 0.11,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: verticalScale(22),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(9),
    borderRadius: scale(999),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  backButtonText: {
    color: colors.textSoft,
    fontSize: scale(13),
    fontWeight: "900",
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
    marginBottom: verticalScale(20),
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    letterSpacing: -1,
  },

  heroCard: {
    marginBottom: verticalScale(16),
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },

  cardTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(20),
    lineHeight: verticalScale(26),
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  cardText: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  sectionCard: {
    marginBottom: verticalScale(14),
    padding: scale(18),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    marginBottom: verticalScale(7),
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "900",
  },

  text: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  warningCard: {
    marginBottom: verticalScale(18),
    padding: scale(18),
    backgroundColor: colors.dangerSoft,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.26)",
  },

  warningTitle: {
    marginBottom: verticalScale(7),
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "900",
  },

  warningText: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },

  clearButton: {
    marginTop: verticalScale(4),
    borderRadius: scale(26),
    overflow: "hidden",
    shadowColor: colors.danger,
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  clearButtonGradient: {
    alignItems: "center",
    paddingVertical: verticalScale(17),
    borderRadius: scale(26),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  clearButtonText: {
    color: colors.white,
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

  successText: {
    marginTop: verticalScale(13),
    color: colors.green,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "800",
    textAlign: "center",
  },
});
