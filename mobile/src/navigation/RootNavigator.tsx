import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../auth/AuthContext";
import Splash from "../screens/Splash";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Onboarding, { AllSetScreen } from "../screens/Onboarding";
import Home from "../screens/Home";
import Settings from "../screens/Settings";
import Tasks from "../screens/Tasks";
import Pomodoro from "../screens/Pomodoro";


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Tasks" component={Tasks} />
      <Tabs.Screen name="Pomodoro" component={Pomodoro} />
      <Tabs.Screen name="Settings" component={Settings} />
    </Tabs.Navigator>
  );
}
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="AllSet" component={AllSetScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return <Splash />;
  }

  return (
    <NavigationContainer>
      {state.status === "signedOut" ? (
        <AuthStack />
      ) : state.user.onboardingComplete ? (
        <AppTabs />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="AllSet" component={AllSetScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}