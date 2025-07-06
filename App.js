import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./config/lang/i18n";
import { useTranslation } from "react-i18next";
import { NativeEventEmitter, NativeModules } from "react-native";
import colors from "./config/color";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import AppContent from "./components/AppContent";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.white,
    accent: colors.brightGreen,
    surface: colors.white,
  },
};

export default function App() {
  useTranslation();
  // custom code for background notifications
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.NotificationServiceExtensionModule
    );
    const subscription = eventEmitter.addListener(
      "NotificationEvent",
      (event) => {
        console.log(
          "NotificationEvent listener js: ",
          JSON.stringify(event.eventProperty, null, 2)
        );
      }
    );

    return () => subscription.remove(); // cleanup
  }, []);

  return (
    <RootSiblingParent>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
});
