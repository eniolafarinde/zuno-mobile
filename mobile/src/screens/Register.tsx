import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function Register({ navigation }: any) {
  const { signUp } = useAuth();
  const [name, setName] = useState("Test User");
  const [email, setEmail] = useState("test2@zuno.app");
  const [password, setPassword] = useState("Password123");

  async function onSubmit() {
    try {
      await signUp(email.trim().toLowerCase(), password, name);
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.response?.data?.message || "Try again");
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Create account</Text>

      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>Email</Text>
      <TextInput autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Button title="Create" onPress={onSubmit} />
      <Button title="Back to login" onPress={() => navigation.goBack()} />
    </View>
  );
}