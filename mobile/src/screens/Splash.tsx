import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";

export default function Splash() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.logo}>Zuno</Text>
      <View style={styles.animationContainer} />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },

  logo: {
    fontSize: 52,
    fontFamily: "Itim_400Regular",
    color: "#000000",
    letterSpacing: 1
  },

  animationContainer: {
    height: 120,
    width: 120,
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center"
  }

});