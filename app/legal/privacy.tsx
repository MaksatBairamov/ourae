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
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(34),
    paddingBottom: verticalScale(36),
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
  privacyCard: {
    marginBottom: verticalScale(20),
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
  text: {
    marginBottom: verticalScale(14),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },
  clearButton: {
    alignItems: "center",
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(17),
    backgroundColor: colors.surface,
    borderRadius: scale(26),
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
    marginTop: verticalScale(13),
    color: colors.green,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "800",
    textAlign: "center",
  },
});
