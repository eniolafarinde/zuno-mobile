import React from "react";
import { AuthProvider } from "./src/auth/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { useFonts } from "expo-font";
import { Itim_400Regular } from "@expo-google-fonts/itim";

export default function App() {
  const [fontsLoaded] = useFonts({
    Itim_400Regular
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  )
}