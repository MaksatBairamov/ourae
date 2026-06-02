import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { analyzeVisualMood, type VisualMoodResult } from "@/lib/vision";

export default function VisualCheckInScreen() {
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<VisualMoodResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function takePhoto() {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Camera permission is required");
      return;
    }

    const photo = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
      allowsEditing: true,
    });

    if (photo.canceled) return;

    setPhotoUri(photo.assets[0].uri);

    setIsAnalyzing(true);

    try {
      const imageBase64 = photo.assets[0].base64 ?? "";

      const visualResult =
        await analyzeVisualMood(imageBase64);

      setResult(visualResult);
    } catch (error) {
      console.error(error);
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
        Ourae will gently analyze visible facial cues.
        This is not a diagnosis.
      </Text>

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.preview}
        />
      ) : (
        <View style={styles.preview}>
          <Text style={styles.cameraText}>
            No photo selected
          </Text>
        </View>
      )}

      <Pressable
        style={styles.button}
        onPress={takePhoto}
      >
        <Text style={styles.buttonText}>
          {isAnalyzing
            ? "Analyzing..."
            : "Take Photo & Analyze"}
        </Text>
      </Pressable>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Suggested state
          </Text>

          <Text style={styles.resultMood}>
            {result.mood}
          </Text>

          <Text style={styles.resultText}>
            Stress: {result.stress}%
          </Text>

          <Text style={styles.resultText}>
            Tiredness: {result.tiredness}%
          </Text>

          <Text style={styles.resultText}>
            Confidence: {result.confidence}%
          </Text>

          <Text style={styles.suggestion}>
            {result.suggestion}
          </Text>

          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue to check-in
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0F1020",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 40,
    marginBottom: 12,
  },

  description: {
    color: "#C9C7D8",
    marginBottom: 20,
  },

  preview: {
    height: 320,
    borderRadius: 24,
    backgroundColor: "#1A1B2E",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  cameraText: {
    color: "#AAA6C8",
    fontWeight: "700",
  },

  button: {
    marginTop: 20,
    backgroundColor: "#8B5CF6",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  resultCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#191A2B",
  },

  resultTitle: {
    color: "#AAA6C8",
    marginBottom: 8,
  },

  resultMood: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
  },

  resultText: {
    color: "#FFFFFF",
    marginBottom: 4,
  },

  suggestion: {
    color: "#C9C7D8",
    marginTop: 12,
  },

  continueButton: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },

  continueButtonText: {
    color: "#111223",
    fontWeight: "900",
  },
});