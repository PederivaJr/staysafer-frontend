import React, { useEffect, useContext, useState } from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  Platform,
  Alert,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import Toast from "react-native-root-toast";
import { vh } from "react-native-expo-viewport-units";
import Screen from "../components/Screen";
import RoundedButton from "../components/RoundedButton";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import useManageLoginTypeApi from "../hooks/useManageLoginType";
import storage from "../auth/storage";
import loginBiometricApi from "../api/loginBiometric";
import { Colors } from "react-native/Libraries/NewAppScreen";

function WelcomeScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricExpired, setIsBiometricExpired] = useState(false);
  const { authenticateWithBiometric } = useManageLoginTypeApi(
    navigation,
    authContext
  );
  // check if biometric token is expired
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = await storage.getToken();
      const expirationString = token?.biometric_expiration;
      if (!expirationString) setIsBiometricExpired(true);
      if (expirationString) {
        // Convert "11.10.2025 13:32:39" to a valid Date object
        const [datePart, timePart] = expirationString.split(" ");
        const [day, month, year] = datePart.split(".");
        const expirationDate = new Date(`${year}-${month}-${day}T${timePart}`);
        const now = new Date();
        if (expirationDate < now) {
          setIsBiometricExpired(true);
          await storage.removeToken();
        }
      }
    };

    checkTokenExpiration();
  }, [authContext.user?.token]);
  // check if device is compatible with biometrics
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const handleBiometricLogin = async () => {
    const biometricKey = await storage.getBiometricKey();
    const token = await storage.getToken();
    // check for token, if not present go to standard login, otherwise use biometric login
    if (!biometricKey || !token?.biometric) navigation.navigate("login");
    if (biometricKey && token?.biometric && isBiometricSupported) {
      const isAuthenticatedWithBiometric = await authenticateWithBiometric();
      // local authentication avalaible
      if (isAuthenticatedWithBiometric) {
        const result = await loginBiometricApi.loginBiometric(
          biometricKey,
          token?.biometric
        );
        /* console.log(
          "biometric login API: ",
          JSON.stringify(result.data, null, 2)
        ); */

        if (!result.ok) {
          navigation.navigate("login"); // If biometric login fails, go to manual login
        }
        if (result.ok) {
          authContext.setUser(result.data.user);
          authContext.setPlan(result.data.plan);
          authContext.setMarkers(result.data.evac_points);
          authContext.setSelectedUsersCheckins(
            result.data.selected_users_checkins
          );
          authContext.setEvacuation(result.data.evacuation);
          authContext.setSettings(result.data.settings);
          authContext.setEvacLists(result.data.evac_lists);
          await storage.storeToken(result.data.token);
          await storage.storeBiometricKey(result.data.user.id);
          await storage.storeUser(result.data.user);
        }
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg3.jpg")}
      style={styles.bgImage}
    >
      <Screen>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName1}>stay</Text>
            <Text style={styles.appName2}>safer</Text>
          </View>
          <View style={styles.buttonContainer}>
            <RoundedButton
              style={styles.fullWidth}
              title={t("login")}
              backgroundColor={colors.darkerGrey}
              borderColor={colors.darkerGrey}
              onPress={() => navigation.navigate("login")}
            />
            {isBiometricSupported && !isBiometricExpired && (
              <RoundedButton
                style={styles.fullWidth}
                title={t("biometric login")}
                backgroundColor={colors.darkerGrey}
                borderColor={colors.darkerGrey}
                onPress={handleBiometricLogin}
              />
            )}
            <RoundedButton
              style={styles.fullWidth}
              title={t("register")}
              backgroundColor={colors.darkerGrey}
              borderColor={colors.darkerGrey}
              onPress={() => navigation.navigate("register")}
            />
          </View>
        </View>
      </Screen>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  appName1: {
    fontSize: 32,
    color: colors.darkerGrey,
  },
  appName2: {
    fontSize: 32,
    color: colors.darkerGrey,
    fontWeight: "bold",
  },
  buttonContainer: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 80,
  },
  logoContainer: {
    flex: 0,
    flexDirection: "row",
    marginBottom: 320,
  },
  fullWidth: {
    width: "100%",
  },
  bgImage: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-end",
  },
});

export default WelcomeScreen;
