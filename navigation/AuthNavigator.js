import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegistrationScreen from "../screens/RegistrationScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import PasswordRecoveryScreen from "../screens/PasswordRecoveryScreen";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const { t, i18n } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        presentation: "modal",
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false, headerTitle: t("header welcome") }}
      />
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{ headerShown: true, headerTitle: t("header login") }}
      />
      <Stack.Screen
        name="register"
        component={RegistrationScreen}
        options={{ headerShown: true, headerTitle: t("header register") }}
      />
      <Stack.Screen
        name="recovery"
        component={PasswordRecoveryScreen}
        options={{ headerShown: true, headerTitle: t("header recovery") }}
      />
    </Stack.Navigator>
  );
};
export default AuthNavigator;
