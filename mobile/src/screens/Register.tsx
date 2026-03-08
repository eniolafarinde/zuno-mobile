import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";

export default function Register({ navigation, route }: any) {
  const passedName = route.params?.name || "";
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(passedName);

    async function onSubmit() {
    try {
      await signUp(email.trim().toLowerCase(), password, name);
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.response?.data?.message || "Try again");
    }
  }

  return (
    <AuthLayout>

      <Text style={styles.title}>Welcome, {name}</Text>
      <Text style={styles.title2}>Let's make studying a breeze!</Text>
      <Text style={styles.subtitle}>Create your account to get started.</Text>


      <Text style={styles.label}>Email Address</Text>
      <TextInput style={styles.input} placeholder="example@email.com" value={email} onChangeText={setEmail} />

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
          Log in
        </Text>
      </Text>

    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    marginTop: -20,
    fontFamily: "Itim_400Regular"
  },
 
  title2: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Itim_400Regular"
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Itim_400Regular"
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
    fontWeight: "600"
  }
});