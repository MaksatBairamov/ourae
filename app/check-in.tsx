import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { isSmallScreen, scale, verticalScale } from "../constants/layout";
import { colors, moodColors, shadows } from "../constants/theme";
import { saveCheckIn } from "../lib/db";

const moodOptions = [
  "Calm",
  "Okay",
  "Tired",
  "Anxious",
  "Sad",
  "Overwhelmed",
  "Motivated",
  "Happy",
] as const;

type Mood = (typeof moodOptions)[number];

const crisisKeywords = [
  "die",
  "dying",
  "kill myself",
  "suicide",
  "end my life",
  "hurt myself",
  "self harm",
  "self-harm",
  "want to disappear",
  "do not want to live",
  "i don't want to live",
  "i dont want to live",
];

const moodHints: Record<Mood, string> = {
  Calm: "steady and grounded",
  Okay: "neutral, present",
  Tired: "low energy",
  Anxious: "activated, tense",
  Sad: "heavy, quiet",
  Overwhelmed: "too much at once",
  Motivated: "ready to move",
  Happy: "light and open",
};

function ScaleSelector({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}) {
  return (
    <View style={styles.scaleBlock}>
      <View style={styles.scaleHeader}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <Text style={[styles.scaleValue, { color }]}>{value}/10</Text>
      </View>

      <View style={styles.scaleTrack}>
        {Array.from({ length: 10 }, (_, index) => {
          const item = index + 1;
          const isActive = item <= value;
          const isSelected = item === value;

          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${item} out of 10`}
              onPress={() => onChange(item)}
              style={styles.scaleTouch}
            >
              <View
                style={[
                  styles.scaleSegment,
                  isActive && { backgroundColor: color },
                  isSelected && styles.scaleSegmentSelected,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabelText}>low</Text>
        <Text style={styles.scaleLabelText}>high</Text>
      </View>
    </View>
  );
}

export default function CheckInScreen() {
  const router = useRouter();

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(3);
  const [note, setNote] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedNote = note.trim();
  const normalizedNote = trimmedNote.toLowerCase();

  const hasCrisisText = useMemo(
    () => crisisKeywords.some((keyword) => normalizedNote.includes(keyword)),
    [normalizedNote],
  );

  const activeMoodColor = selectedMood
    ? moodColors[selectedMood]
    : colors.violet;

  const isRiskState = useMemo(() => {
    const riskyMood =
      selectedMood === "Overwhelmed" ||
      selectedMood === "Sad" ||
      selectedMood === "Anxious";

    return riskyMood && anxiety >= 8 && energy <= 3;
  }, [selectedMood, anxiety, energy]);

  const shouldGoToSupport = isRiskState || hasCrisisText;
  const canContinue = Boolean(selectedMood) && !isSubmitting;

  const handleSelectMood = useCallback(async (mood: Mood) => {
    setSelectedMood(mood);
    setShowValidation(false);

    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available on every platform.
    }
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selectedMood) {
      setShowValidation(true);

      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      } catch {
        // Haptics may not be available on every platform.
      }

      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const checkInPayload = {
        mood: selectedMood,
        energy,
        anxiety,
        note: trimmedNote,
      };

      await saveCheckIn(checkInPayload);

      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics may not be available on every platform.
      }

      router.push({
        pathname: shouldGoToSupport ? "/panic" : "/summary",
        params: {
          mood: selectedMood,
          energy: String(energy),
          anxiety: String(anxiety),
          note: trimmedNote,
        },
      });
    } catch (error) {
      console.error("Failed to save check-in:", error);
      setShowValidation(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    anxiety,
    energy,
    isSubmitting,
    router,
    selectedMood,
    shouldGoToSupport,
    trimmedNote,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.glow, { backgroundColor: activeMoodColor }]} />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Quick check-in</Text>
          <Text style={styles.title}>What is your inner weather?</Text>
          <Text style={styles.subtitle}>
            Choose the closest feeling. No perfect answer needed.
          </Text>
        </View>

        <View style={styles.moodHero}>
          <Text style={styles.moodHeroLabel}>Current mood</Text>

          <Text
            style={[
              styles.moodHeroValue,
              selectedMood && { color: activeMoodColor },
            ]}
          >
            {selectedMood ?? "Select one"}
          </Text>

          <Text style={styles.moodHeroHint}>
            {selectedMood ? moodHints[selectedMood] : "tap a mood below"}
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.moodBlock}>
            <Text style={styles.sectionTitle}>Mood</Text>

            <View style={styles.moodGrid}>
              {moodOptions.map((mood) => {
                const isActive = selectedMood === mood;
                const moodColor = moodColors[mood];

                return (
                  <Pressable
                    key={mood}
                    accessibilityRole="button"
                    accessibilityLabel={`Select mood ${mood}`}
                    onPress={() => handleSelectMood(mood)}
                    style={({ pressed }) => [
                      styles.moodItem,
                      isActive && styles.moodItemActive,
                      pressed && styles.moodItemPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.moodOrb,
                        {
                          backgroundColor: moodColor,
                          opacity: isActive ? 1 : 0.42,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.moodText,
                        isActive && {
                          color: colors.text,
                        },
                      ]}
                    >
                      {mood}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {showValidation ? (
              <Text style={styles.validationText}>
                Select a mood first. The app is emotional, not psychic.
              </Text>
            ) : null}
          </View>

          <ScaleSelector
            label="Energy"
            value={energy}
            onChange={setEnergy}
            color={colors.green}
          />

          <ScaleSelector
            label="Anxiety"
            value={anxiety}
            onChange={setAnxiety}
            color={colors.danger}
          />

          <View style={styles.noteBlock}>
            <Text style={styles.sectionTitle}>Write one thought</Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What is sitting in your head right now?"
              placeholderTextColor={colors.textFaint}
              multiline
              maxLength={500}
              style={[styles.input, { borderColor: activeMoodColor }]}
              textAlignVertical="top"
            />

            <Text style={styles.helperText}>
              {trimmedNote.length > 0
                ? `${trimmedNote.length}/500 characters`
                : "Optional, but useful for AI insight."}
            </Text>
          </View>

          {shouldGoToSupport ? (
            <View style={styles.softAlert}>
              <Text style={styles.softAlertTitle}>Support mode is ready</Text>
              <Text style={styles.softAlertText}>
                Your check-in suggests you may need something calmer and safer
                right now. Ourae will guide you to support mode.
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            shouldGoToSupport ? "Go to support mode" : "Complete check-in"
          }
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.continueButton,
            { backgroundColor: activeMoodColor },
            !canContinue && styles.continueButtonDisabled,
            pressed && canContinue && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {isSubmitting
              ? "Saving..."
              : shouldGoToSupport
                ? "Go to support mode"
                : "Complete check-in"}
          </Text>
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
    paddingBottom: verticalScale(32),
    backgroundColor: colors.bg,
  },
  glow: {
    position: "absolute",
    top: verticalScale(56),
    right: scale(-104),
    width: scale(280),
    height: scale(280),
    borderRadius: scale(140),
    opacity: 0.16,
  },

  header: {
    marginBottom: verticalScale(26),
  },
  eyebrow: {
    marginBottom: verticalScale(10),
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.7,
    textTransform: "uppercase",
  },
  title: {
    marginBottom: verticalScale(10),
    color: colors.text,
    fontSize: isSmallScreen ? scale(29) : scale(36),
    lineHeight: isSmallScreen ? verticalScale(35) : verticalScale(42),
    fontWeight: "900",
    letterSpacing: -1.1,
  },
  subtitle: {
    maxWidth: scale(305),
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    fontWeight: "600",
  },

  moodHero: {
    marginBottom: verticalScale(20),
  },
  moodHeroLabel: {
    marginBottom: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  moodHeroValue: {
    color: colors.text,
    fontSize: scale(46),
    lineHeight: verticalScale(52),
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  moodHeroHint: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(14),
    fontWeight: "700",
  },

  panel: {
    marginBottom: verticalScale(20),
    padding: scale(18),
    backgroundColor: colors.surface,
    borderRadius: scale(32),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  moodBlock: {
    marginBottom: verticalScale(30),
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
    marginTop: verticalScale(14),
  },
  moodItem: {
    width: "47%",
    minHeight: verticalScale(52),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingHorizontal: scale(11),
    paddingVertical: verticalScale(9),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodItemActive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  moodItemPressed: {
    opacity: 0.72,
  },
  moodOrb: {
    width: scale(23),
    height: scale(23),
    borderRadius: scale(11.5),
  },
  moodText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "900",
  },

  validationText: {
    marginTop: verticalScale(12),
    color: colors.danger,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "800",
  },

  scaleBlock: {
    marginBottom: verticalScale(30),
  },
  scaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  scaleValue: {
    fontSize: scale(22),
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  scaleTrack: {
    flexDirection: "row",
    gap: scale(6),
  },
  scaleTouch: {
    flex: 1,
    paddingVertical: verticalScale(8),
  },
  scaleSegment: {
    height: verticalScale(8),
    borderRadius: scale(999),
    backgroundColor: "rgba(23,19,33,0.11)",
  },
  scaleSegmentSelected: {
    height: verticalScale(15),
    marginTop: verticalScale(-3.5),
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(2),
  },
  scaleLabelText: {
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  noteBlock: {
    marginTop: verticalScale(2),
  },
  input: {
    minHeight: verticalScale(132),
    marginTop: verticalScale(12),
    padding: scale(18),
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    borderRadius: scale(26),
    borderWidth: 1,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "600",
  },
  helperText: {
    marginTop: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(12),
    lineHeight: verticalScale(18),
    fontWeight: "700",
  },

  softAlert: {
    marginTop: verticalScale(18),
    padding: scale(16),
    backgroundColor: colors.dangerSoft,
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: "rgba(201,67,90,0.22)",
  },
  softAlertTitle: {
    marginBottom: verticalScale(6),
    color: colors.text,
    fontSize: scale(14),
    fontWeight: "900",
  },
  softAlertText: {
    color: colors.textSoft,
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "700",
  },

  continueButton: {
    alignItems: "center",
    paddingVertical: verticalScale(18),
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  continueButtonPressed: {
    opacity: 0.86,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: colors.textInverse,
    fontSize: scale(16),
    fontWeight: "900",
  },
});
