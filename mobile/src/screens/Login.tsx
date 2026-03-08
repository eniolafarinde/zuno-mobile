import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert("Login failed", e?.response?.data?.message || "Try again");
    }
  }

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

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
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
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "Itim_400Regular"
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
    fontFamily: "Itim_400Regular"
  },

  label: {
    marginBottom: 6,
    fontWeight: "500",
    fontFamily: "Itim_400Regular"
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    fontFamily: "Itim_400Regular"
  },

  button: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Itim_400Regular"
  },

  footer: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
    fontFamily: "Itim_400Regular" 
  },

  link: {
    color: "#000000",
    fontWeight: "600",
    fontFamily: "Itim_400Regular"
  }
});