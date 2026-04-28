import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
        {Array.from({ length: 10 }, (_, i) => i + 1).map((item) => {
          const isActive = item <= value;
          const isSelected = item === value;

          return (
            <Pressable
              key={item}
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
  const trimmedNote = note.trim();

  const normalizedNote = trimmedNote.toLowerCase();

  const hasCrisisText = crisisKeywords.some((keyword) =>
    normalizedNote.includes(keyword),
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

  const canContinue = Boolean(selectedMood);

  const handleContinue = () => {
    if (!canContinue) {
      setShowValidation(true);
      return;
    }

    const checkInPayload = {
      mood: selectedMood,
      energy,
      anxiety,
      note: trimmedNote,
    };

    saveCheckIn(checkInPayload);

    const routeParams = {
      mood: selectedMood ?? "",
      energy: String(energy),
      anxiety: String(anxiety),
      note: trimmedNote,
    };

    const shouldGoToSupport = isRiskState || hasCrisisText;

    router.push({
      pathname: shouldGoToSupport ? ("/panic" as any) : ("/summary" as any),
      params: routeParams,
    });
  };

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

        <View style={styles.moodGrid}>
          {moodOptions.map((mood) => {
            const isActive = selectedMood === mood;
            const moodColor = moodColors[mood];

            return (
              <Pressable
                key={mood}
                onPress={() => {
                  setSelectedMood(mood);
                  setShowValidation(false);
                }}
                style={styles.moodItem}
              >
                <View
                  style={[
                    styles.moodOrb,
                    {
                      backgroundColor: moodColor,
                      opacity: isActive ? 1 : 0.28,
                      transform: [{ scale: isActive ? 1.12 : 1 }],
                    },
                  ]}
                />
                <Text
                  style={[styles.moodText, isActive && { color: colors.text }]}
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

        <View style={styles.panel}>
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
            />

            <Text style={styles.helperText}>
              {trimmedNote.length > 0
                ? `${trimmedNote.length}/500 characters`
                : "Optional, but useful for AI insight."}
            </Text>
          </View>

          {isRiskState ? (
            <View style={styles.softAlert}>
              <Text style={styles.softAlertTitle}>Support mode is ready</Text>
              <Text style={styles.softAlertText}>
                Your check-in suggests high tension and low energy. Ourae will
                guide you to a calmer screen.
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          style={[
            styles.continueButton,
            { backgroundColor: activeMoodColor },
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {isRiskState ? "Go to support mode" : "Complete check-in"}
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
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(26),
    paddingBottom: verticalScale(28),
    backgroundColor: colors.bg,
  },
  glow: {
    position: "absolute",
    top: verticalScale(70),
    right: scale(-90),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    opacity: 0.14,
  },
  header: {
    marginBottom: verticalScale(24),
  },
  eyebrow: {
    fontSize: scale(11),
    fontWeight: "900",
    color: colors.cyan,
    textTransform: "uppercase",
    letterSpacing: 1.7,
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: isSmallScreen ? scale(28) : scale(34),
    lineHeight: isSmallScreen ? verticalScale(35) : verticalScale(41),
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: verticalScale(10),
  },
  subtitle: {
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    color: colors.textMuted,
  },
  moodHero: {
    marginBottom: verticalScale(18),
  },
  moodHeroLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
  },
  moodHeroValue: {
    color: colors.text,
    fontSize: scale(42),
    lineHeight: verticalScale(48),
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  moodHeroHint: {
    color: colors.textMuted,
    fontSize: scale(14),
    marginTop: verticalScale(4),
    fontWeight: "700",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
    marginBottom: verticalScale(20),
  },
  moodItem: {
    width: "47%",
    minHeight: verticalScale(56),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  moodOrb: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
  },
  moodText: {
    color: colors.textMuted,
    fontSize: scale(15),
    fontWeight: "900",
  },
  validationText: {
    color: colors.danger,
    fontSize: scale(13),
    lineHeight: verticalScale(19),
    fontWeight: "800",
    marginBottom: verticalScale(16),
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.028)",
    borderRadius: scale(30),
    padding: scale(18),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: verticalScale(18),
    ...shadows.soft,
  },
  scaleBlock: {
    marginBottom: verticalScale(28),
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
  },
  scaleValue: {
    fontSize: scale(22),
    fontWeight: "900",
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
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
  },
  scaleSegmentSelected: {
    height: verticalScale(14),
    marginTop: verticalScale(-3),
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(2),
  },
  scaleLabelText: {
    color: colors.textFaint,
    fontSize: scale(11),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  noteBlock: {
    marginTop: verticalScale(2),
  },
  input: {
    minHeight: verticalScale(132),
    marginTop: verticalScale(12),
    backgroundColor: "rgba(255,255,255,0.035)",
    borderRadius: scale(26),
    borderWidth: 1,
    padding: scale(18),
    color: colors.text,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    textAlignVertical: "top",
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
    borderRadius: scale(22),
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.28)",
  },
  softAlertTitle: {
    color: colors.danger,
    fontSize: scale(14),
    fontWeight: "900",
    marginBottom: verticalScale(6),
  },
  softAlertText: {
    color: "#FECACA",
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "700",
  },
  continueButton: {
    borderRadius: scale(24),
    paddingVertical: verticalScale(17),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: colors.violet,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.65,
  },
  continueButtonText: {
    color: "#05060D",
    fontSize: scale(16),
    fontWeight: "900",
  },
});
