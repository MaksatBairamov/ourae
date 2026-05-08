import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";

export default function BackgroundGradient() {
  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={["#05060D", "#0A0D18", "#111427", "#080A12"]}
        locations={[0, 0.28, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          "rgba(115,92,255,0.18)",
          "rgba(115,92,255,0.08)",
          "transparent",
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.7, y: 0.9 }}
        style={styles.violetGlow}
      />

      <LinearGradient
        colors={[
          "rgba(16,185,208,0.14)",
          "rgba(16,185,208,0.05)",
          "transparent",
        ]}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.1, y: 1 }}
        style={styles.cyanGlow}
      />

      <LinearGradient
        colors={["rgba(255,255,255,0.04)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topLight}
      />

      <View style={styles.noiseOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },

  violetGlow: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 340,
    height: 340,
    borderRadius: 999,
    opacity: 0.9,
  },

  cyanGlow: {
    position: "absolute",
    bottom: -140,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 999,
    opacity: 0.85,
  },

  topLight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    opacity: 0.45,
  },

  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.012)",
  },
});
