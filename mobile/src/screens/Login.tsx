import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("test@zuno.app");
  const [password, setPassword] = useState("Password123");

  async function onSubmit() {
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert("Login failed", e?.response?.data?.message || "Try again");
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Zuno</Text>
      <Text>Email</Text>
      <TextInput
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <Text>Password</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <Button title="Login" onPress={onSubmit} />
      <Button title="Create account" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}