import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function PanicScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Take a moment.</Text>

        <Text style={styles.text}>
          What you're feeling right now is intense, but it will pass.
        </Text>

        <Text style={styles.text}>
          Slow your breathing. Inhale gently, then exhale longer than you
          inhale.
        </Text>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Grounding 5-4-3-2-1</Text>
          <Text style={styles.boxText}>
            5 things you see{"\n"}4 things you can touch{"\n"}3 things you hear
            {"\n"}2 things you smell{"\n"}1 thing you appreciate
          </Text>
        </View>

        <Pressable style={styles.button} onPress={() => router.push("/")}>
          <Text style={styles.buttonText}>Back to home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#CBD5E1",
    marginBottom: 12,
    lineHeight: 22,
  },
  box: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#121A2E",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  boxTitle: {
    color: "#7C3AED",
    fontWeight: "700",
    marginBottom: 10,
  },
  boxText: {
    color: "#E2E8F0",
    lineHeight: 22,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
