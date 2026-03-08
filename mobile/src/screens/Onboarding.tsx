import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding({ navigation }: any) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const next = () => setStep((prev) => prev + 1);

  const goToRegister = () => {
    navigation.navigate("Register", { name });
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 0 && (
        <View style={styles.centerScreen}>
          <Text style={styles.logo}>Zuno</Text>
          <View style={styles.animationSpace} />
          <TouchableOpacity style={styles.primaryButton} onPress={next}>
            <Text style={styles.primaryButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 1 && (
        <View style={styles.screen}>
          <View style={styles.content}>
            <View style={styles.topSpacer} />
            <View style={styles.illustrationPlaceholder} />

            <Text style={styles.title}>Hello, I'm Zuno</Text>
            <Text style={styles.subtitle}>
              Your personal study companion.
            </Text>
          </View>

          <View style={styles.bottomArea}>
            <TouchableOpacity style={styles.primaryButton} onPress={next}>
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            <ProgressDots step={1} total={3} />
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.screen}>
          <View style={styles.content}>
            <View style={styles.topSpacer} />
            <Text style={styles.title}>Let’s get personal</Text>
            <Text style={styles.subtitle}>What may I call you?</Text>

            <TextInput
              placeholder="Your name..."
              placeholderTextColor="#8A8A8A"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.bottomArea}>
            <TouchableOpacity style={styles.primaryButton} onPress={goToRegister}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
            <ProgressDots step={2} total={3} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export function AllSetScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerScreen}>
        <Text style={styles.title}>All set!</Text>
        <Text style={styles.subtitle}>Ready when you are</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace("Home")}
        >
          <Text style={styles.primaryButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProgressDots({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }, (_, index) => {
        const current = index + 1;
        const isActive = current === step;
        return (
          <View
            key={current}
            style={[styles.dot, isActive && styles.activeDot]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  screen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: "space-between",
  },

  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomArea: {
    paddingBottom: 10,
  },

  topSpacer: {
    height: 40,
  },

  logo: {
    fontSize: 44,
    color: "#000000",
    fontFamily: "Itim_400Regular",
  },

  animationSpace: {
    width: 140,
    height: 140,
    marginVertical: 40,
  },

  illustrationPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    marginBottom: 28,
  },

  title: {
    fontSize: 34,
    color: "#000000",
    textAlign: "center",
    fontFamily: "Itim_400Regular",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#5F5F5F",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },

  primaryButton: {
    backgroundColor: "#000000",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 200,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Itim_400Regular",
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#D1D1D1",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 20,
    backgroundColor: "#000000",
  },
});