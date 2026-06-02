import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { analyzeVisualMood, type VisualMoodResult } from "@/lib/vision";

export default function VisualCheckInScreen() {
  const router = useRouter();
  const [result, setResult] = useState<VisualMoodResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleAnalyze() {
    setIsAnalyzing(true);

    try {
      const visualResult = await analyzeVisualMood();
      setResult(visualResult);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleContinue() {
    if (!result) return;

    router.push({
      pathname: "/check-in",
      params: {
        visualMood: result.mood,
        visualStress: String(result.stress),
        visualTiredness: String(result.tiredness),
        visualConfidence: String(result.confidence),
      },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visual Mood Scan</Text>

      <Text style={styles.description}>
        Ourae will gently analyze visual emotional signals. This is not a
        diagnosis, just a reflection aid.
      </Text>

      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraText}>Camera preview coming next</Text>
      </View>

      <Pressable style={styles.button} onPress={handleAnalyze}>
        <Text style={styles.buttonText}>
          {isAnalyzing ? "Analyzing..." : "Analyze visual mood"}
        </Text>
      </Pressable>

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Suggested state</Text>
          <Text style={styles.resultMood}>{result.mood}</Text>

          <Text style={styles.resultText}>Stress: {result.stress}%</Text>
          <Text style={styles.resultText}>Tiredness: {result.tiredness}%</Text>
          <Text style={styles.resultText}>
            Confidence: {result.confidence}%
          </Text>

          <Text style={styles.suggestion}>{result.suggestion}</Text>

          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to check-in</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#0F1020",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 12,
  },
  description: {
    color: "#C9C7D8",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  cameraPlaceholder: {
    height: 260,
    borderRadius: 28,
    backgroundColor: "#1A1B2E",
    borderWidth: 1,
    borderColor: "#2D2F46",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  cameraText: {
    color: "#9C98B8",
    fontWeight: "700",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  resultCard: {
    marginTop: 22,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#191A2B",
    borderWidth: 1,
    borderColor: "#2D2F46",
  },
  resultTitle: {
    color: "#AAA6C8",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  resultMood: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
  },
  resultText: {
    color: "#D9D7E8",
    fontSize: 14,
    marginBottom: 4,
  },
  suggestion: {
    color: "#C9C7D8",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  continueButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#111223",
    fontSize: 14,
    fontWeight: "900",
  },
});
