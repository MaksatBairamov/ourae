import { ScrollView, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "../../constants/layout";
import { colors } from "../../constants/theme";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Ourae legal</Text>
      <Text style={styles.title}>Terms of Use</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reflection, not professional care.</Text>
        <Text style={styles.text}>
          Ourae is a self-reflection tool designed to support emotional
          awareness. It does not provide medical, psychological, or professional
          advice.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        By using this app, you agree that:
      </Text>

      <Text style={styles.text}>
        • You use the app at your own discretion.{"\n"}• Ourae does not replace
        professional care.{"\n"}• The creators are not responsible for decisions
        made based only on app content.
      </Text>

      <Text style={styles.text}>
        If you are in distress or need urgent support, contact a qualified
        professional or emergency services.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(34),
    paddingBottom: verticalScale(36),
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
    marginBottom: verticalScale(20),
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    letterSpacing: -1,
  },
  card: {
    marginBottom: verticalScale(20),
    padding: scale(20),
    backgroundColor: colors.surface,
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(20),
    lineHeight: verticalScale(26),
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  sectionTitle: {
    marginBottom: verticalScale(10),
    color: colors.text,
    fontSize: scale(17),
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  text: {
    marginBottom: verticalScale(14),
    color: colors.textSoft,
    fontSize: scale(14),
    lineHeight: verticalScale(21),
    fontWeight: "700",
  },
});
