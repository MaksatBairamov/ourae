import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { getRecentCheckIns } from "../lib/db";

export default function SummaryScreen() {
  const router = useRouter();
  const recent = getRecentCheckIns();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Check-in complete</Text>

        <Text style={styles.text}>
          Good job. You paused and noticed your current state.
        </Text>

        <Text style={styles.text}>Saved check-ins: {recent.length}</Text>

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
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#CBD5E1",
    lineHeight: 22,
    marginBottom: 10,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
