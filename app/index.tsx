import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale } from "../constants/layout";

const slides = [
  { text: "MAD?", image: require("../assets/images/mad.png") },
  { text: "SAD?", image: require("../assets/images/sad.png") },
  { text: "HAPPY?", image: require("../assets/images/happy.png") },
  { text: "ALL AT ONCE?", image: require("../assets/images/all_at_once.png") },
  {
    text: "WRITE IT DOWN.",
    image: require("../assets/images/write_it_down.png"),
  },
  { text: "BREATHE.", image: require("../assets/images/shout.png") },
];

export default function IntroScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const goHome = useCallback(() => {
    router.replace("/home" as any);
  }, [router]);

  const animateSlide = useCallback(() => {
    opacity.setValue(0);
    scaleAnim.setValue(0.96);
    translateX.setValue(Math.random() > 0.5 ? -scale(10) : scale(10));

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(620),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scaleAnim, translateX]);

  useEffect(() => {
    animateSlide();

    Animated.timing(progress, {
      toValue: 1,
      duration: slides.length * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= slides.length - 1) {
          clearInterval(interval);
          setTimeout(goHome, 600);
          return prev;
        }

        animateSlide();
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [animateSlide, goHome, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Pressable style={styles.screen} onPress={goHome}>
        <StatusBar hidden />

        <ImageBackground
          source={currentSlide.image}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.vignette} />

          <View style={styles.noiseLayer}>
            <View style={styles.scanLineOne} />
            <View style={styles.scanLineTwo} />
            <View style={styles.rgbLineOne} />
            <View style={styles.rgbLineTwo} />
          </View>

          <View style={styles.content}>
            <View style={styles.topBar}>
              <Text style={styles.counter}>
                {String(currentIndex + 1).padStart(2, "0")}
              </Text>

              <Text style={styles.brand}>OURAE</Text>
            </View>

            <Animated.View
              style={[
                styles.textWrap,
                {
                  opacity,
                  transform: [{ scale: scaleAnim }, { translateX }],
                },
              ]}
            >
              <Text style={styles.glitchShadowRed}>{currentSlide.text}</Text>
              <Text style={styles.glitchShadowBlue}>{currentSlide.text}</Text>
              <Text style={styles.mainText}>{currentSlide.text}</Text>
            </Animated.View>

            <View style={styles.bottomBlock}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[styles.progressFill, { width: progressWidth }]}
                />
              </View>

              <Text style={styles.skipText}>tap to enter</Text>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  background: {
    flex: 1,
    backgroundColor: "#000000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: scale(18),
    borderColor: "rgba(0,0,0,0.28)",
  },
  noiseLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  scanLineOne: {
    position: "absolute",
    top: "28%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.58)",
  },
  scanLineTwo: {
    position: "absolute",
    top: "64%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  rgbLineOne: {
    position: "absolute",
    top: "39%",
    left: scale(20),
    width: "74%",
    height: 2,
    backgroundColor: "rgba(255,0,120,0.72)",
  },
  rgbLineTwo: {
    position: "absolute",
    top: "74%",
    right: scale(20),
    width: "58%",
    height: 2,
    backgroundColor: "rgba(0,240,255,0.70)",
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(28),
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counter: {
    color: "#FFFFFF",
    fontSize: scale(14),
    fontWeight: "900",
    letterSpacing: 3,
  },
  brand: {
    color: "rgba(255,255,255,0.74)",
    fontSize: scale(12),
    fontWeight: "900",
    letterSpacing: 3,
  },
  textWrap: {
    position: "relative",
    justifyContent: "center",
  },
  mainText: {
    color: "#FFFFFF",
    fontSize: scale(48),
    lineHeight: verticalScale(54),
    fontWeight: "900",
    letterSpacing: -1.4,
    textTransform: "uppercase",
  },
  glitchShadowRed: {
    position: "absolute",
    left: scale(-3),
    top: verticalScale(-2),
    color: "#FF2A6D",
    fontSize: scale(48),
    lineHeight: verticalScale(54),
    fontWeight: "900",
    opacity: 0.72,
    textTransform: "uppercase",
  },
  glitchShadowBlue: {
    position: "absolute",
    left: scale(3),
    top: verticalScale(2),
    color: "#22D3EE",
    fontSize: scale(48),
    lineHeight: verticalScale(54),
    fontWeight: "900",
    opacity: 0.72,
    textTransform: "uppercase",
  },
  bottomBlock: {
    gap: verticalScale(14),
  },
  progressTrack: {
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  skipText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: scale(12),
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
