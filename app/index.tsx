import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

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
        <ActivityIndicator color={colors.primary} />
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
  },
});
