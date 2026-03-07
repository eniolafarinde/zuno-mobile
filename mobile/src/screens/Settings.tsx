import React from "react";
import { View, Button, Text } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function Settings() {
  const { signOut, state } = useAuth();

  return (
    <View style={{ padding: 16, gap: 12 }}>
      {state.status === "signedIn" && <Text>Signed in as {state.user.email}</Text>}
      <Button title="Log out" onPress={signOut} />
    </View>
  );
}