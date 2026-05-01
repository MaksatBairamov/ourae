import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { scale, verticalScale } from "../../constants/layout";
import { colors } from "../../constants/theme";
import { clearAllCheckIns } from "../../lib/db";

export default function PrivacyScreen() {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Ourae privacy</Text>
      <Text style={styles.title}>Privacy Policy</Text>

      <View style={styles.privacyCard}>
        <Text style={styles.cardTitle}>Your data stays on this device.</Text>
        <Text style={styles.cardText}>
          Your check-ins are stored locally. Ourae does not use an external
          database for your saved entries in this version.
        </Text>
      </View>

      <Text style={styles.text}>
        Ourae stores your mood, energy, anxiety, note, and check-in time locally
        on your device.
      </Text>

      <Text style={styles.text}>
        If AI reflection is used, the check-in content may be sent to a
        third-party AI provider for processing. Do not enter information you do
        not want to share.
      </Text>

      <Text style={styles.text}>
        Ourae is not a medical service and does not provide diagnosis,
        treatment, or emergency support.
      </Text>

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
        <Text style={styles.clearButtonText}>
          {isClearing ? "Clearing..." : "Clear my data"}
        </Text>
      </Pressable>

      {hasCleared ? (
        <Text style={styles.successText}>
          Local check-ins have been deleted.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(34),
    paddingBottom: verticalScale(34),
  },
  kicker: {
    marginBottom: verticalScale(10),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    marginBottom: verticalScale(18),
    color: colors.text,
    fontSize: scale(30),
    lineHeight: verticalScale(36),
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  privacyCard: {
    marginBottom: verticalScale(18),
    padding: scale(18),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(18),
    lineHeight: verticalScale(24),
    fontWeight: "900",
  },
  cardText: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "600",
  },
  text: {
    marginBottom: verticalScale(14),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "600",
  },
  clearButton: {
    alignItems: "center",
    marginTop: verticalScale(14),
    paddingVertical: verticalScale(16),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  clearButtonText: {
    color: colors.text,
    fontSize: scale(15),
    fontWeight: "900",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  successText: {
    marginTop: verticalScale(12),
    color: colors.textMuted,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "700",
    textAlign: "center",
  },
});
