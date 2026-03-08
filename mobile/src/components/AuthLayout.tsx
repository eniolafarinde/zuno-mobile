import React from "react";
import { View, StyleSheet } from "react-native";

export default function AuthLayout({ children }: any) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 80,
    justifyContent: "center"
  }
});