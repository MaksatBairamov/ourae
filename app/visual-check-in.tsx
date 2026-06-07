import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { analyzeVisualMood, type VisualMoodResult } from "@/lib/vision";

export default function VisualCheckInScreen() {
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<VisualMoodResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Camera permission is required");
      return;
    }

    const photo = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
      allowsEditing: true,
      aspect: [4, 5],
    });

    if (photo.canceled) return;

    const asset = photo.assets[0];

    setPhotoUri(asset.uri);
    setResult(null);
    setIsAnalyzing(true);

    try {
      const imageBase64 = asset.base64 ?? "";
      const visualResult = await analyzeVisualMood(imageBase64);

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Visual Mood Scan</Text>

        <Text style={styles.description}>
          A gentle visual check-in based only on visible facial cues. This is
          not a diagnosis.
        </Text>
      </View>

      <View style={styles.previewCard}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraTitle}>No photo selected</Text>
            <Text style={styles.cameraText}>
              Take a quick photo to estimate your current visual state.
            </Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" />
            <Text style={styles.analyzingText}>Analyzing visual cues...</Text>
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isAnalyzing && styles.buttonDisabled,
        ]}
        onPress={takePhoto}
        disabled={isAnalyzing}
      >
        <Text style={styles.buttonText}>
          {isAnalyzing ? "Analyzing..." : "Take Photo & Analyze"}
        </Text>
      </Pressable>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultLabel}>Suggested state</Text>
              <Text style={styles.resultMood}>{result.mood}</Text>
            </View>

            <View style={styles.confidencePill}>
              <Text style={styles.confidenceText}>
                {result.confidence}% confidence
              </Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric label="Stress" value={result.stress} />
            <Metric label="Tiredness" value={result.tiredness} />
          </View>

          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionLabel}>Suggested action</Text>
            <Text style={styles.suggestion}>{result.suggestion}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue to check-in</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTopRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 44,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 22,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(139, 92, 246, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.28)",
    marginBottom: 16,
  },

  badgeText: {
    color: "#C4B5FD",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 12,
  },

  description: {
    color: "#C8C7D9",
    fontSize: 15,
    lineHeight: 22,
  },

  previewCard: {
    width: "100%",
    height: 330,
    borderRadius: 30,
    backgroundColor: "#17182B",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 18,
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  emptyPreview: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#17182B",
  },

  cameraIcon: {
    color: "#A78BFA",
    fontSize: 38,
    marginBottom: 16,
  },

  cameraTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },

  cameraText: {
    color: "#AAA6C8",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },

  analyzingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(11, 16, 32, 0.78)",
  },

  analyzingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontWeight: "800",
  },

  button: {
    backgroundColor: "#8B5CF6",
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  resultCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#17182B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 18,
  },

  resultLabel: {
    color: "#A5A2C3",
    fontSize: 13,
    marginBottom: 6,
  },

  resultMood: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  confidencePill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(52, 211, 153, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.28)",
  },

  confidenceText: {
    color: "#86EFAC",
    fontSize: 12,
    fontWeight: "800",
  },

  metrics: {
    gap: 12,
    marginBottom: 16,
  },

  metricCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.045)",
  },

  metricTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  metricLabel: {
    color: "#D8D6EA",
    fontWeight: "700",
  },

  metricValue: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#A78BFA",
  },

  suggestionBox: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.18)",
    marginBottom: 18,
  },

  suggestionLabel: {
    color: "#C4B5FD",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  suggestion: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },

  continueButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
  },

  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  continueButtonText: {
    color: "#111223",
    fontWeight: "900",
    fontSize: 15,
  },
});
