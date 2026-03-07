import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AuthLayout from "../components/AuthLayout";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout>

      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Please login to your account</Text>

      <Text style={styles.label}>E-mail Address</Text>
      <TextInput
        style={styles.input}
        placeholder="example@email.com"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Don't have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          Sign up
        </Text>
      </Text>

    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 6
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 32
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
  },

  footer: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280"
  },

  link: {
    color: "#000000",
    fontWeight: "600"
  }
});