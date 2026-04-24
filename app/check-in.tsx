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

export default function CheckInScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(3);
  const [note, setNote] = useState("");

  const isRiskState = useMemo(() => {
    const riskyMood =
      selectedMood === "Overwhelmed" ||
      selectedMood === "Sad" ||
      selectedMood === "Anxious";

    return riskyMood && anxiety >= 8 && energy <= 3;
  }, [selectedMood, anxiety, energy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Quick check-in</Text>
        <Text style={styles.title}>How do you feel right now?</Text>
        <Text style={styles.subtitle}>
          This takes less than a minute. Just enough to help you notice your
          current state.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.optionsGrid}>
            {moodOptions.map((mood) => {
              const isActive = selectedMood === mood;

              return (
                <Pressable
                  key={mood}
                  onPress={() => setSelectedMood(mood)}
                  style={[
                    styles.optionButton,
                    isActive && styles.optionButtonActive,
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
                    isActive && styles.scaleButtonActive,
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
                    isActive && styles.scaleButtonActive,
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
            placeholderTextColor="#64748B"
            multiline
            style={styles.input}
          />
        </View>

        {isRiskState ? (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>
              Please slow down for a moment.
            </Text>
            <Text style={styles.alertText}>
              You seem to be having a difficult moment. Ourae can guide you to a
              calmer screen and show support options next.
            </Text>
          </View>
        ) : null}

        <Pressable
          style={styles.continueButton}
          onPress={() => {
            saveCheckIn({
              mood: selectedMood,
              energy,
              anxiety,
              note,
            });

            if (isRiskState) {
              router.push("/panic");
            } else {
              router.push("/summary");
            }
          }}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: "#0B1020",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#94A3B8",
    marginBottom: 28,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E2E8F0",
    marginBottom: 14,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#121A2E",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  optionButtonActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  optionText: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  scaleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  scaleButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121A2E",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  scaleButtonActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  scaleButtonText: {
    color: "#CBD5E1",
    fontWeight: "700",
  },
  scaleButtonTextActive: {
    color: "#FFFFFF",
  },
  input: {
    minHeight: 120,
    backgroundColor: "#121A2E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 16,
    color: "#F8FAFC",
    fontSize: 16,
    textAlignVertical: "top",
  },
  alertCard: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    padding: 18,
    marginBottom: 20,
  },
  alertTitle: {
    color: "#FCA5A5",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  alertText: {
    color: "#FECACA",
    fontSize: 15,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
