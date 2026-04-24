import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const slides = [
  {
    text: "MAD?",
    image: require("../assets/images/mad.png"),
  },
  {
    text: "SAD?",
    image: require("../assets/images/sad.png"),
  },
  {
    text: "HAPPY?",
    image: require("../assets/images/happy.png"),
  },
  {
    text: "ALL AT ONCE???",
    image: require("../assets/images/all_at_once.png"),
  },
  {
    text: "WRITE IT DOWN.",
    image: require("../assets/images/write_it_down.png"),
  },
  {
    text: "SHOUT.",
    image: require("../assets/images/shout.png"),
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateText = () => {
      opacity.setValue(0);
      scale.setValue(0.95);
      translateX.setValue(Math.random() > 0.5 ? -12 : 12);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
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
        Animated.delay(650),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    };

    animateText();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= slides.length - 1) {
          clearInterval(interval);

          setTimeout(() => {
            router.replace("/home" as any);
          }, 700);

          return prev;
        }

        animateText();
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [opacity, router, scale, translateX]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable style={styles.screen} onPress={() => router.replace("/home")}>
        <StatusBar hidden />

        <ImageBackground
          source={slides[currentIndex].image}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay} />

          <View style={styles.noiseLayer}>
            <View style={styles.scanLineOne} />
            <View style={styles.scanLineTwo} />
            <View style={styles.rgbLineOne} />
            <View style={styles.rgbLineTwo} />
          </View>

          <View style={styles.content}>
            <Text style={styles.counter}>
              {String(currentIndex + 1).padStart(2, "0")}
            </Text>

            <Animated.View
              style={[
                styles.textWrap,
                {
                  opacity,
                  transform: [{ scale }, { translateX }],
                },
              ]}
            >
              <Text style={styles.glitchShadowRed}>
                {slides[currentIndex].text}
              </Text>
              <Text style={styles.glitchShadowBlue}>
                {slides[currentIndex].text}
              </Text>
              <Text style={styles.mainText}>{slides[currentIndex].text}</Text>
            </Animated.View>

            <Text style={styles.skipText}>tap to enter</Text>
          </View>
        </ImageBackground>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  noiseLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  scanLineOne: {
    position: "absolute",
    top: "26%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  scanLineTwo: {
    position: "absolute",
    top: "62%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  rgbLineOne: {
    position: "absolute",
    top: "38%",
    left: 24,
    width: "70%",
    height: 3,
    backgroundColor: "rgba(255,0,180,0.75)",
  },
  rgbLineTwo: {
    position: "absolute",
    top: "72%",
    right: 24,
    width: "55%",
    height: 3,
    backgroundColor: "rgba(0,255,255,0.75)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "space-between",
  },
  counter: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 3,
  },
  textWrap: {
    position: "relative",
    justifyContent: "center",
  },
  mainText: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "900",
    letterSpacing: -1,
    textTransform: "uppercase",
  },
  glitchShadowRed: {
    position: "absolute",
    left: -3,
    top: -2,
    color: "#FF005C",
    fontSize: 54,
    fontWeight: "900",
    opacity: 0.75,
    textTransform: "uppercase",
  },
  glitchShadowBlue: {
    position: "absolute",
    left: 3,
    top: 2,
    color: "#00F0FF",
    fontSize: 54,
    fontWeight: "900",
    opacity: 0.75,
    textTransform: "uppercase",
  },
  skipText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
