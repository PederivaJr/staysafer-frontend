import { useContext } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { AuthContext } from "../context/AuthContext";
import storage from "../auth/storage";
import loginBiometricApi from "../api/loginBiometric";
import Toast from "react-native-root-toast";
import { useTranslation } from "react-i18next";

const useManageLoginType = () => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  // 🔹 Function to authenticate via biometrics
  const authenticateWithBiometric = async () => {
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();

    if (!isBiometricAvailable) return false;
    if (isBiometricAvailable) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("auth fingerprint"),
        cancelLabel: t("cancel"),
      });
      return result.success;
    }
  };

  // 🔹 Function to log in using stored biometric key
  const handleBiometricLogin = async () => {
    const biometricKey = await storage.getBiometricKey();
    const token = await storage.getToken();
    if (!biometricKey || !token?.biometric) return { success: false };

    const result = await loginBiometricApi.loginBiometric(
      biometricKey,
      token?.biometric
    );
    console.log("biometric login API: ", JSON.stringify(result, null, 2));
    if (!result.ok) {
      Toast.show(t(result.data?.error_code || "toast error general"), {
        duration: Toast.durations.LONG,
      });
      return { success: false };
    }
    if (result.ok) {
      authContext.setUser(result.data.user);
      authContext.setPlan(result.data.plan);
      authContext.setMarkers(result.data.evac_points);
      authContext.setSelectedUsersCheckins(result.data.selected_users_checkins);
      authContext.setEvacuation(result.data.evacuation);
      authContext.setSettings(result.data.settings);
      await storage.storeToken(result.data.token);
      await storage.storeBiometricKey(result.data.user.id);
      await storage.storeUser(result.data.user);

      return { success: true };
    }
  };
  return { authenticateWithBiometric, handleBiometricLogin };
};

export default useManageLoginType;
