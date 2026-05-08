import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
import { scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

const DISCLAIMER_ACCEPTED_KEY = "ourae.disclaimerAccepted";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    async function checkDisclaimer() {
      try {
        const accepted = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
        setHasAccepted(accepted === "true");
      } catch {
        setHasAccepted(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkDisclaimer();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <BackgroundGradient />
        <GlowOrb />

        <View style={styles.card}>
          <Text style={styles.logo}>Ourae</Text>
          <Text style={styles.subtitle}>Preparing your emotional space</Text>

          <ActivityIndicator
            color={colors.cyan}
            size="small"
            style={styles.loader}
          />
        </View>
      </View>
    );
  }

  return <Redirect href={hasAccepted ? "/home" : "/disclaimer"} />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    overflow: "hidden",
  },

  card: {
    alignItems: "center",
    paddingHorizontal: scale(26),
    paddingVertical: verticalScale(26),
    borderRadius: scale(30),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  logo: {
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    letterSpacing: -1.1,
  },

  subtitle: {
    marginTop: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "700",
  },

  loader: {
    marginTop: verticalScale(18),
  },
});
