import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
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

const moodMicrocopy: Record<Mood, string> = {
  Calm: "Your system seems steady. Keep it simple.",
  Okay: "Neutral is still useful data. Humanity survives another minute.",
  Tired: "Low battery mode detected. No shame in that.",
  Anxious: "Your nervous system is running in tabs-on-tabs mode.",
  Sad: "Heavy does not mean broken. It means noticeable.",
  Overwhelmed: "Too many signals at once. We slow it down.",
  Motivated:
    "Good. Use the momentum before your brain holds a committee meeting.",
  Happy: "Nice. Rare creature spotted: emotional bandwidth.",
};

function ScaleSelector({
  label,
  value,
  onChange,
  color,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <View style={styles.scaleBlock}>
      <View style={styles.scaleHeader}>
        <View>
          <Text style={styles.sectionTitle}>{label}</Text>
          <Text style={styles.scaleSubtext}>
            {lowLabel} to {highLabel}
          </Text>
        </View>

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
                  isActive && {
                    backgroundColor: color,
                    shadowColor: color,
                  },
                  isSelected && styles.scaleSegmentSelected,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabelText}>{lowLabel}</Text>
        <Text style={styles.scaleLabelText}>{highLabel}</Text>
      </View>
    </View>
  );
}

function toOptionalNumber(value?: string): number | null {
  if (!value) return null;

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return null;

  return numberValue;
}

function mapVisualMoodToMood(visualMood?: string): Mood | null {
  if (!visualMood) return null;

  const normalized = visualMood.toLowerCase();

  if (normalized.includes("tired")) return "Tired";
  if (normalized.includes("tense")) return "Anxious";
  if (normalized.includes("stress")) return "Anxious";
  if (normalized.includes("sad")) return "Sad";
  if (normalized.includes("happy")) return "Happy";
  if (normalized.includes("calm")) return "Calm";
  if (normalized.includes("motivated")) return "Motivated";
  if (normalized.includes("overwhelmed")) return "Overwhelmed";

  return null;
}

export default function CheckInScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    visualMood?: string;
    visualStress?: string;
    visualTiredness?: string;
    visualConfidence?: string;
  }>();

  const hasVisualMood = Boolean(params.visualMood);
  const visualStress = useMemo(
    () => toOptionalNumber(params.visualStress),
    [params.visualStress],
  );

  const visualTiredness = useMemo(
    () => toOptionalNumber(params.visualTiredness),
    [params.visualTiredness],
  );

  const visualConfidence = useMemo(
    () => toOptionalNumber(params.visualConfidence),
    [params.visualConfidence],
  );
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(3);
  const [note, setNote] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedMood || !params.visualMood) return;

    const suggestedMood = mapVisualMoodToMood(params.visualMood);

    if (suggestedMood) {
      setSelectedMood(suggestedMood);
    }
  }, [params.visualMood, selectedMood]);

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

  const handleScaleChange = useCallback(
    async (nextValue: number, setter: (value: number) => void) => {
      setter(nextValue);

      try {
        await Haptics.selectionAsync();
      } catch {
        // Haptics may not be available on every platform.
      }
    },
    [],
  );

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

        visualMood: params.visualMood ?? null,
        visualStress: params.visualStress ? Number(params.visualStress) : null,
        visualTiredness: params.visualTiredness
          ? Number(params.visualTiredness)
          : null,
        visualConfidence: params.visualConfidence
          ? Number(params.visualConfidence)
          : null,
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
    params.visualConfidence,
    params.visualMood,
    params.visualStress,
    params.visualTiredness,
    router,
    selectedMood,
    shouldGoToSupport,
    trimmedNote,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <BackgroundGradient />
      <GlowOrb />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          pointerEvents="none"
          style={[styles.glow, { backgroundColor: activeMoodColor }]}
        />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Quick check-in</Text>
          <Text style={styles.title}>What is your inner weather?</Text>
          <Text style={styles.subtitle}>
            Choose the closest signal. No perfect answer needed.
          </Text>
        </View>

        <View style={styles.moodHero}>
          <View style={styles.moodHeroTop}>
            <Text style={styles.moodHeroLabel}>Current mood</Text>

            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: activeMoodColor,
                  shadowColor: activeMoodColor,
                },
              ]}
            />
          </View>

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

          <Text style={styles.moodHeroCopy}>
            {selectedMood
              ? moodMicrocopy[selectedMood]
              : "Small input now, better pattern later. Annoyingly reasonable."}
          </Text>
        </View>
        {hasVisualMood ? (
          <View style={styles.visualInsightCard}>
            <Text style={styles.visualInsightLabel}>
              Visual scan suggestion
            </Text>

            <Text style={styles.visualInsightMood}>{params.visualMood}</Text>

            <Text style={styles.visualInsightText}>
              Stress {visualStress ?? "-"}% · Tiredness {visualTiredness ?? "-"}
              % · Confidence {visualConfidence ?? "-"}%
            </Text>

            <Text style={styles.visualInsightNote}>
              This is not a diagnosis. It is only a reflection aid. Please
              choose how you actually feel.
            </Text>
          </View>
        ) : null}
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
                      isActive && [
                        styles.moodItemActive,
                        {
                          borderColor: moodColor,
                          shadowColor: moodColor,
                        },
                      ],
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.moodOrb,
                        {
                          backgroundColor: moodColor,
                          shadowColor: moodColor,
                          opacity: isActive ? 1 : 0.48,
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
            onChange={(value) => handleScaleChange(value, setEnergy)}
            color={colors.green}
            lowLabel="low"
            highLabel="charged"
          />

          <ScaleSelector
            label="Anxiety"
            value={anxiety}
            onChange={(value) => handleScaleChange(value, setAnxiety)}
            color={colors.danger}
            lowLabel="quiet"
            highLabel="loud"
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
              style={[
                styles.input,
                {
                  borderColor: selectedMood
                    ? activeMoodColor
                    : colors.borderStrong,
                },
              ]}
              textAlignVertical="top"
            />

            <Text style={styles.helperText}>
              {trimmedNote.length > 0
                ? `${trimmedNote.length}/500 characters`
                : "Optional, but useful for a better summary."}
            </Text>
          </View>

          {shouldGoToSupport ? (
            <View style={styles.softAlert}>
              <Text style={styles.softAlertTitle}>Support mode is ready</Text>
              <Text style={styles.softAlertText}>
                This check-in suggests you may need something calmer and safer
                right now. Ourae will guide you into support mode.
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
            {
              shadowColor: activeMoodColor,
            },
            pressed && canContinue && styles.continueButtonPressed,
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={[
              activeMoodColor,
              shouldGoToSupport ? colors.dangerDeep : colors.violetDeep,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueButtonText}>
              {isSubmitting
                ? "Saving..."
                : shouldGoToSupport
                  ? "Go to support mode"
                  : "Complete check-in"}
            </Text>
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
    paddingBottom: verticalScale(34),
    overflow: "visible",
  },

  glow: {
    position: "absolute",
    top: verticalScale(60),
    right: scale(-120),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    opacity: 0.14,
  },

  header: {
    marginBottom: verticalScale(24),
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
    padding: scale(20),
    borderRadius: scale(32),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },

  moodHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  moodHeroLabel: {
    marginBottom: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  liveDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  moodHeroValue: {
    color: colors.text,
    fontSize: scale(43),
    lineHeight: verticalScale(49),
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  moodHeroHint: {
    marginTop: verticalScale(4),
    color: colors.textMuted,
    fontSize: scale(14),
    fontWeight: "800",
  },

  moodHeroCopy: {
    marginTop: verticalScale(12),
    color: colors.textSoft,
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "700",
  },
  visualInsightCard: {
    marginBottom: verticalScale(20),
    padding: scale(18),
    borderRadius: scale(28),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },

  visualInsightLabel: {
    marginBottom: verticalScale(8),
    color: colors.cyan,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  visualInsightMood: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(24),
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  visualInsightText: {
    color: colors.textSoft,
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "800",
  },

  visualInsightNote: {
    marginTop: verticalScale(10),
    color: colors.textMuted,
    fontSize: scale(12),
    lineHeight: verticalScale(18),
    fontWeight: "700",
  },
  panel: {
    marginBottom: verticalScale(20),
    padding: scale(18),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(32),
    borderWidth: 1,
    borderColor: colors.border,
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
    minHeight: verticalScale(54),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    backgroundColor: colors.surfaceGlass,
    borderRadius: scale(21),
    borderWidth: 1,
    borderColor: colors.border,
  },

  moodItemActive: {
    backgroundColor: colors.surfaceElevated,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },

  moodOrb: {
    width: scale(23),
    height: scale(23),
    borderRadius: scale(11.5),
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
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
    alignItems: "flex-start",
    marginBottom: verticalScale(12),
    gap: scale(16),
  },

  sectionTitle: {
    color: colors.text,
    fontSize: scale(16),
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  scaleSubtext: {
    marginTop: verticalScale(3),
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
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
    backgroundColor: "rgba(255,255,255,0.105)",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
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
    backgroundColor: colors.surface,
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
    borderColor: "rgba(251,113,133,0.26)",
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
    borderRadius: scale(28),
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
    overflow: "hidden",
  },

  continueGradient: {
    alignItems: "center",
    paddingVertical: verticalScale(18),
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  continueButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  continueButtonDisabled: {
    opacity: 0.58,
  },

  continueButtonText: {
    color: colors.white,
    fontSize: scale(16),
    fontWeight: "900",
  },
});
