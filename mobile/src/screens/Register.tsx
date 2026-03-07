import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const [step] = useState(1);

  return (
    <AuthLayout>

      <Text style={styles.title}>Sign up</Text>
      <Text style={styles.subtitle}>Let's keep it quick, just 2 steps</Text>

      {/* progress bar */}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: step === 1 ? "50%" : "100%" }]} />
      </View>

      <Text style={styles.label}>Email Address</Text>
      <TextInput style={styles.input} placeholder="example@email.com" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} secureTextEntry />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "700"
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 20
  },

  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 30
  },

  progressFill: {
    height: 4,
    backgroundColor: "#000000",
    borderRadius: 2
  },

  label: {
    marginBottom: 6,
    fontWeight: "500"
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    borderRadius: 10,
    marginBottom: 18
  },

  button: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  }
});