import React, { useState, useContext } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { vh, vw, em, vmin, vmax } from "react-native-expo-viewport-units";
import Icon from "../components/Icon";
import SetupListItem from "../components/SetupListItem";
import { AuthContext } from "../context/AuthContext";
import cache from "../utility/cache";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import updateSettingsApi from "../api/updateSettings";
import * as globals from "../config/globals";
import Screen from "../components/Screen";

function ManageSafetyMethodScreen() {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const canToggleMethod = (method, value) => {
    const methodKey = `${method}_active`;
    const confirmedSave = authContext.settings.confirmed_save;
    // Helper function to count active keys
    const countActiveSafetyMethods = () => {
      return Object.keys(authContext.settings).filter(
        (key) => key.endsWith("_active") && authContext.settings[key]
      )?.length;
    };
    if (value) {
      // If enabling the method, no check is necessary
      return true;
    }
    if (!value) {
      // block disabling  methods during events
      if (authContext.evacuation?.real_event || authContext.evacuation?.drill) {
        Toast.show(t("err_settings_2"), {
          duration: Toast.durations.LONG,
        });
        return false;
      }
      // If disabling the method, count the active keys
      const activeCount = countActiveSafetyMethods();
      if (confirmedSave && activeCount <= 2) {
        Toast.show(t("toast at least two methods active"), {
          duration: Toast.durations.LONG,
        });
        return false;
      }
      // If confirmed_save is not active or there are more than 2 active methods
      const allOthersDisabled = globals.SAFETY_METHODS.every((type) => {
        const key = `${type}_active`;
        if (key === methodKey) {
          return true;
        }
        if (authContext.settings.hasOwnProperty(key)) {
          return !authContext.settings[key];
        } else {
          return true; // Assuming non-existent keys don't affect the toggling
        }
      });
      if (allOthersDisabled) {
        Toast.show(t("toast at least one method active"), {
          duration: Toast.durations.LONG,
        });
      }
      return !allOthersDisabled;
    }
  };
  const toggleManualCheck = async (newValue) => {
    if (canToggleMethod("manual", newValue)) {
      // if method can be disabled, update settings
      let updatedSettings = { ...authContext.settings };
      updatedSettings.manual_active = newValue;
      //call API
      const result = await updateSettingsApi.updateSettings(updatedSettings);
      //console.log("toggle safety methods: ", result)
      if (result.ok) {
        authContext.setSettings(result.data.settings);
      }
    }
  };
  const toggleGPS = async (newValue) => {
    if (canToggleMethod("gps", newValue)) {
      let updatedSettings = { ...authContext.settings };
      updatedSettings.gps_active = newValue;
      //call API
      const result = await updateSettingsApi.updateSettings(updatedSettings);
      if (result.ok) {
        authContext.setSettings(result.data.settings);
      }
    }
  };
  const toggleNFC = async (newValue) => {
    if (canToggleMethod("nfc", newValue)) {
      let updatedSettings = { ...authContext.settings };
      updatedSettings.nfc_active = newValue;
      //call API
      const result = await updateSettingsApi.updateSettings(updatedSettings);
      if (result.ok) {
        authContext.setSettings(result.data.settings);
      }
    }
  };

  return (
    <View style={styles.container}>
      <SetupListItem
        ImageComponent={
          <Icon
            name={
              authContext.settings.manual_active
                ? "eye-check-outline"
                : "eye-outline"
            }
            size={64}
            backgroundColor={colors.white}
            iconColor={colors.grey}
            border={colors.grey}
          />
        }
        title={t("manage safety methods title manual")}
        description={t("manage safety methods description manual")}
        value={authContext?.settings.manual_active}
        onValueChange={toggleManualCheck}
        disabled={true}
      />
      <SetupListItem
        ImageComponent={
          <Icon
            name={
              authContext.settings.gps_active
                ? "map-marker-check"
                : "map-marker"
            }
            size={64}
            backgroundColor={colors.white}
            iconColor={colors.grey}
            border={colors.grey}
          />
        }
        title={t("manage safety methods title gps")}
        description={t("manage safety methods description gps")}
        value={authContext?.settings.gps_active}
        onValueChange={toggleGPS}
      />
      <SetupListItem
        ImageComponent={
          <Icon
            name={authContext.settings.nfc_active ? "nfc" : "nfc"}
            size={64}
            backgroundColor={colors.white}
            iconColor={colors.grey}
            border={colors.grey}
          />
        }
        title={t("manage safety methods title nfc")}
        description={t("manage safety methods description nfc")}
        value={authContext?.settings.nfc_active}
        onValueChange={toggleNFC}
        disabled={false}
      />
      {/* <SetupListItem 
                    ImageComponent={<Icon name={authContext.isBadge ? "smart-card" : "smart-card-outline" } size={64} backgroundColor='#ccc' iconColor='#fafafa' />}
                    title={t('manage safety methods title badge')}
                    description={t('manage safety methods description badge')}
                    value={authContext.isBadge}
                    onValueChange={toggleBadge}
                    disabled = {true}
                />
                <SetupListItem 
                    ImageComponent={<Icon name="lighthouse" size={64} backgroundColor='#ccc' iconColor='#fafafa' />}
                    title={t('manage safety methods title beacon')}
                    description={t('manage safety methods description beacon')}
                    value={authContext.isBeacon}
                    onValueChange={toggleBeacon}
                    disabled = {true}
                /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lighterGrey,
  },
});

export default ManageSafetyMethodScreen;
