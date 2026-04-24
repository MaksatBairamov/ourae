import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Welcome back</Text>
          <Text style={styles.brand}>Ourae</Text>
          <Text style={styles.subtitle}>
            A private space to notice, write down, and understand what you feel.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />

          <Text style={styles.cardLabel}>Daily check-in</Text>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>

          <Text style={styles.cardText}>
            Take a short emotional check-in and let Ourae help you slow down,
            reflect, and recognize your patterns over time.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/check-in" as any)}
          >
            <Text style={styles.primaryButtonText}>Start check-in</Text>
          </Pressable>
        </View>

        <View style={styles.footerBlock}>
          <Text style={styles.footerLabel}>Coming soon</Text>
          <Text style={styles.footerText}>
            Journal · panic support · local insights · camera-based mood scan
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(34),
    justifyContent: "space-between",
    backgroundColor: colors.bg,
  },
  hero: {
    marginTop: verticalScale(20),
  },
  kicker: {
    color: colors.cyan,
    fontSize: scale(12),
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: verticalScale(12),
  },
  brand: {
    fontSize: scale(44),
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: verticalScale(12),
    fontSize: scale(16),
    lineHeight: verticalScale(24),
    color: colors.textMuted,
    maxWidth: scale(320),
  },
  card: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderRadius: scale(28),
    padding: scale(24),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.violet,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.violetHot,
  },
  cardLabel: {
    color: colors.violetHot,
    fontSize: scale(12),
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: verticalScale(14),
  },
  cardTitle: {
    fontSize: scale(24),
    fontWeight: "900",
    color: colors.text,
    marginBottom: verticalScale(12),
  },
  cardText: {
    fontSize: scale(15),
    lineHeight: verticalScale(23),
    color: colors.textSoft,
    marginBottom: verticalScale(24),
  },
  primaryButton: {
    backgroundColor: colors.violet,
    borderRadius: scale(18),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: colors.violet,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(16),
    fontWeight: "800",
  },
  footerBlock: {
    marginBottom: verticalScale(10),
  },
  footerLabel: {
    fontSize: scale(12),
    fontWeight: "800",
    color: colors.cyan,
    marginBottom: verticalScale(8),
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  footerText: {
    fontSize: scale(14),
    lineHeight: verticalScale(22),
    color: colors.textMuted,
  },
});
