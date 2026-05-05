import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { scale, verticalScale } from "../constants/layout";
import { colors } from "../constants/theme";

import { initDatabase } from "../lib/db";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error("App startup failed:", error);
        setStartupError("Something went wrong while preparing the app.");
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, []);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  if (startupError) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Ourae could not start</Text>
          <Text style={styles.errorText}>{startupError}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(24),
    backgroundColor: colors.bg,
  },
  errorTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(22),
    fontWeight: "900",
    textAlign: "center",
  },
  errorText: {
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "700",
    textAlign: "center",
  },
});
