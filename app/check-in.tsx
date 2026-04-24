import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { isSmallScreen, scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";
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
];

const moodColors: Record<string, string> = {
  Calm: colors.cyan,
  Okay: "#38BDF8",
  Tired: "#A78BFA",
  Anxious: colors.danger,
  Sad: "#60A5FA",
  Overwhelmed: colors.pink,
  Motivated: colors.green,
  Happy: colors.amber,
};

export default function CheckInScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(3);
  const [note, setNote] = useState("");

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Quick check-in</Text>
          <Text style={styles.title}>How do you feel right now?</Text>
          <Text style={styles.subtitle}>
            A short pause to notice your current emotional state.
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood</Text>

            <View style={styles.optionsGrid}>
              {moodOptions.map((mood) => {
                const isActive = selectedMood === mood;
                const moodColor = moodColors[mood];

                return (
                  <Pressable
                    key={mood}
                    onPress={() => setSelectedMood(mood)}
                    style={[
                      styles.optionButton,
                      isActive && {
                        backgroundColor: moodColor,
                        borderColor: moodColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}
                    >
                      {mood}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy: {energy}/10</Text>
            <View style={styles.scaleRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => {
                const isActive = energy === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() => setEnergy(value)}
                    style={[
                      styles.scaleButton,
                      isActive && {
                        backgroundColor: colors.green,
                        borderColor: colors.green,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scaleButtonText,
                        isActive && styles.scaleButtonTextActive,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anxiety: {anxiety}/10</Text>
            <View style={styles.scaleRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => {
                const isActive = anxiety === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() => setAnxiety(value)}
                    style={[
                      styles.scaleButton,
                      isActive && {
                        backgroundColor: colors.danger,
                        borderColor: colors.danger,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scaleButtonText,
                        isActive && styles.scaleButtonTextActive,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is on your mind?</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Write a short note..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={[
                styles.input,
                selectedMood && { borderColor: activeMoodColor },
              ]}
            />
          </View>

          {isRiskState ? (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>
                Please slow down for a moment.
              </Text>
              <Text style={styles.alertText}>
                This looks like a difficult moment. Ourae can guide you to a
                calmer screen and show support options next.
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.continueButton,
              selectedMood && {
                backgroundColor: activeMoodColor,
                shadowColor: activeMoodColor,
              },
            ]}
            onPress={() => {
              saveCheckIn({
                mood: selectedMood,
                energy,
                anxiety,
                note,
              });

              if (isRiskState) {
                router.push("/panic" as any);
              } else {
                router.push("/summary" as any);
              }
            }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(42),
    backgroundColor: colors.bg,
  },
  header: {
    marginBottom: verticalScale(24),
  },
  eyebrow: {
    fontSize: scale(12),
    fontWeight: "800",
    color: colors.cyan,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: isSmallScreen ? scale(27) : scale(32),
    lineHeight: isSmallScreen ? verticalScale(34) : verticalScale(39),
    fontWeight: "900",
    color: colors.text,
    marginBottom: verticalScale(10),
  },
  subtitle: {
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    color: colors.textMuted,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: scale(28),
    padding: scale(18),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.violet,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  section: {
    marginBottom: verticalScale(28),
  },
  sectionTitle: {
    fontSize: scale(17),
    fontWeight: "800",
    color: colors.text,
    marginBottom: verticalScale(14),
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
  },
  optionButton: {
    paddingVertical: verticalScale(11),
    paddingHorizontal: scale(15),
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    color: colors.textSoft,
    fontSize: scale(14),
    fontWeight: "700",
  },
  optionTextActive: {
    color: "#05060D",
  },
  scaleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
  },
  scaleButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(13),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scaleButtonText: {
    color: colors.textSoft,
    fontSize: scale(14),
    fontWeight: "800",
  },
  scaleButtonTextActive: {
    color: "#05060D",
  },
  input: {
    minHeight: verticalScale(122),
    backgroundColor: colors.surfaceElevated,
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: colors.border,
    padding: scale(16),
    color: colors.text,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    textAlignVertical: "top",
  },
  alertCard: {
    backgroundColor: colors.dangerSoft,
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.45)",
    padding: scale(18),
    marginBottom: verticalScale(20),
  },
  alertTitle: {
    color: colors.danger,
    fontSize: scale(17),
    fontWeight: "900",
    marginBottom: verticalScale(8),
  },
  alertText: {
    color: "#FECACA",
    fontSize: scale(14),
    lineHeight: verticalScale(22),
  },
  continueButton: {
    backgroundColor: colors.violet,
    borderRadius: scale(20),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginTop: verticalScale(4),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: colors.violet,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: scale(16),
    fontWeight: "900",
  },
});
