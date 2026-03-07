import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Onboarding() {
  const { refreshMe } = useAuth();
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("23:00");

  async function save() {
    try {
      await api.put("/me/onboarding", {
        studyWindow: { start, end },
        preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        remindersEnabled: true,
      });
      await refreshMe();
    } catch (e: any) {
      Alert.alert("Failed", e?.response?.data?.message || "Try again");
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Set your study hours</Text>

      <Text>Start (HH:MM)</Text>
      <TextInput value={start} onChangeText={setStart} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Text>End (HH:MM)</Text>
      <TextInput value={end} onChangeText={setEnd} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />

      <Button title="Finish onboarding" onPress={save} />
    </View>
  );
}