import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "../../components/BackgroundGradient";
import GlowOrb from "../../components/GlowOrb";
import { scale, verticalScale } from "../../constants/layout";
import { colors, shadows } from "../../constants/theme";

export default function TermsScreen() {
  const router = useRouter();

  const handleBack = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics may not be available.
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <BackgroundGradient />
      <GlowOrb />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View pointerEvents="none" style={styles.glowPurple} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.kicker}>Ourae legal</Text>
        <Text style={styles.title}>Terms of Use</Text>

        <LinearGradient
          colors={[colors.surfaceStrong, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.cardTitle}>
            Reflection, not professional care.
          </Text>

          <Text style={styles.text}>
            Ourae is a self-reflection tool designed to support emotional
            awareness. It does not provide medical, psychological, psychiatric,
            or professional advice. Humanity loves turning apps into therapists.
            History suggests that usually ends weirdly.
          </Text>
        </LinearGradient>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            By using this app, you agree that:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                You use the app at your own discretion.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Ourae does not replace therapy, diagnosis, or professional care.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                The creators are not responsible for decisions made solely based
                on app content.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Emergency situations</Text>

          <Text style={styles.warningText}>
            If you are in distress, feel unsafe, or believe you may harm
            yourself or someone else, contact emergency services or a qualified
            professional immediately.
          </Text>
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            Continued use of Ourae means you understand and accept these terms.
          </Text>
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
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(42),
  },

  glowPurple: {
    position: "absolute",
    top: verticalScale(100),
    right: scale(-120),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    backgroundColor: colors.violet,
    opacity: 0.12,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: verticalScale(24),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(9),
    borderRadius: scale(999),
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  backButtonText: {
    color: colors.textSoft,
    fontSize: scale(13),
    fontWeight: "900",
  },

  kicker: {
    marginBottom: verticalScale(10),
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },

  title: {
    marginBottom: verticalScale(22),
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    letterSpacing: -1,
  },

  heroCard: {
    marginBottom: verticalScale(18),
    padding: scale(22),
    borderRadius: scale(30),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.glass,
  },

  cardTitle: {
    marginBottom: verticalScale(10),
    color: colors.text,
    fontSize: scale(21),
    lineHeight: verticalScale(28),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  sectionCard: {
    marginBottom: verticalScale(18),
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    marginBottom: verticalScale(16),
    color: colors.text,
    fontSize: scale(17),
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  bulletList: {
    gap: verticalScale(14),
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(12),
  },

  bulletDot: {
    width: scale(7),
    height: scale(7),
    marginTop: verticalScale(7),
    borderRadius: scale(3.5),
    backgroundColor: colors.violet,
  },

  bulletText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(22),
    fontWeight: "700",
  },

  warningCard: {
    marginBottom: verticalScale(18),
    padding: scale(20),
    backgroundColor: colors.dangerSoft,
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.24)",
  },

  warningTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(17),
    fontWeight: "900",
  },

  warningText: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(22),
    fontWeight: "700",
  },

  footerCard: {
    padding: scale(18),
    backgroundColor: colors.surfaceSoft,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: colors.border,
  },

  footerText: {
    color: colors.textMuted,
    fontSize: scale(13),
    lineHeight: verticalScale(20),
    fontWeight: "700",
    textAlign: "center",
  },

  text: {
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(22),
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
