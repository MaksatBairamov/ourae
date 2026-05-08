import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import BackgroundGradient from "../components/BackgroundGradient";
import GlowOrb from "../components/GlowOrb";
import { scale, verticalScale } from "../constants/layout";
import { colors, shadows } from "../constants/theme";
import { initDatabase } from "../lib/db";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const prepareApp = async () => {
      try {
        setStartupError(null);
        await initDatabase();
      } catch (error) {
        console.error("App startup failed:", error);

        if (isMounted) {
          setStartupError("Something went wrong while preparing the app.");
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }

        try {
          await SplashScreen.hideAsync();
        } catch {
          // Splash screen may already be hidden.
        }
      }
    };

    prepareApp();

    return () => {
      isMounted = false;
    };
  }, [retryKey]);

  const handleRetry = useCallback(() => {
    setIsReady(false);
    setStartupError(null);
    setRetryKey((value) => value + 1);
  }, []);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <BackgroundGradient />
          <GlowOrb />

          <View style={styles.loadingCard}>
            <Text style={styles.logo}>Ourae</Text>
            <Text style={styles.loadingText}>Preparing your space</Text>

            <ActivityIndicator
              color={colors.cyan}
              size="small"
              style={styles.loader}
            />
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  if (startupError) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorScreen}>
          <BackgroundGradient />
          <GlowOrb />

          <View style={styles.errorCard}>
            <Text style={styles.errorEyebrow}>Startup error</Text>
            <Text style={styles.errorTitle}>Ourae could not start</Text>
            <Text style={styles.errorText}>{startupError}</Text>

            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
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
    overflow: "hidden",
  },

  loadingCard: {
    alignItems: "center",
    paddingHorizontal: scale(26),
    paddingVertical: verticalScale(26),
    borderRadius: scale(30),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },

  logo: {
    color: colors.text,
    fontSize: scale(34),
    lineHeight: verticalScale(40),
    fontWeight: "900",
    letterSpacing: -1.1,
  },

  loadingText: {
    marginTop: verticalScale(8),
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: "700",
  },

  loader: {
    marginTop: verticalScale(18),
  },

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(24),
    backgroundColor: colors.bg,
    overflow: "hidden",
  },

  errorCard: {
    width: "100%",
    maxWidth: scale(340),
    padding: scale(22),
    borderRadius: scale(30),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },

  errorEyebrow: {
    marginBottom: verticalScale(8),
    color: colors.danger,
    fontSize: scale(11),
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  errorTitle: {
    marginBottom: verticalScale(8),
    color: colors.text,
    fontSize: scale(24),
    lineHeight: verticalScale(30),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  errorText: {
    marginBottom: verticalScale(18),
    color: colors.textMuted,
    fontSize: scale(15),
    lineHeight: verticalScale(22),
    fontWeight: "700",
  },

  retryButton: {
    alignItems: "center",
    paddingVertical: verticalScale(15),
    borderRadius: scale(24),
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: scale(15),
    fontWeight: "900",
  },
});
