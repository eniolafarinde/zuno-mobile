import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../auth/AuthContext";

// Screens (create these files)
import Login from "../screens/Login";
import Register from "../screens/Register";
import Onboarding from "../screens/Onboarding";
import Home from "../screens/Home";
import Settings from "../screens/Settings";


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Settings" component={Settings} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { state } = useAuth();

  return (
    <NavigationContainer>
      {state.status === "loading" ? (
        <Stack.Navigator>
          <Stack.Screen name="Loading" component={() => null} />
        </Stack.Navigator>
      ) : state.status === "signedOut" ? (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      ) : state.user.onboardingComplete ? (
        <AppTabs />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Onboarding" component={Onboarding} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}