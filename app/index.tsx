import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Ourae</Text>
          <Text style={styles.subtitle}>Your emotional wellness space.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <Text style={styles.cardText}>
            Start with a quick emotional check-in and let Ourae help you slow
            down, reflect, and understand your patterns.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/check-in")}
          >
            <Text style={styles.primaryButtonText}>Start check-in</Text>
          </Pressable>
        </View>

        <View style={styles.footerBlock}>
          <Text style={styles.footerLabel}>Coming soon</Text>
          <Text style={styles.footerText}>
            Journal, panic support mode, local insights, camera-based mood scan.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "space-between",
    backgroundColor: "#0B1020",
  },
  hero: {
    marginTop: 20,
  },
  brand: {
    fontSize: 42,
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 26,
    color: "#94A3B8",
  },
  card: {
    backgroundColor: "#121A2E",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#CBD5E1",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footerBlock: {
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#94A3B8",
  },
});
