import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, View, Text, Platform, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";
import cache from "../utility/cache";
import { vh } from "react-native-expo-viewport-units";
import Screen from "../components/Screen";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import Icon from "../components/Icon";
import Toast from "react-native-root-toast";
import SystemSetupListItem from "../components/SystemSetupListItem";
import ProminentDisclosureNotification from "../components/ProminentDisclosureNotification";
import Constants from "expo-constants";
import updateSettingsApi from "../api/updateSettings";
import RNPickerSelect from "react-native-picker-select";
import * as Notifications from "expo-notifications";
import { ScrollView } from "react-native-gesture-handler";
import useActiveSafetyMethods from "../hooks/useActiveSafetyMethods";
import SystemSetupArrowItem from "../components/SystemSetupArrowItem";
import useInitOneSignal from "../hooks/useInitOnesignal";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";

function ManageSystemScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [disclosureModalVisible, setDisclosureModalVisible] = useState(false);
  let count = useActiveSafetyMethods();
  const { initializeOneSignal } = useInitOneSignal();

  // check notifications permissions at load
  useEffect(() => {
    const checkNotificationPermission = async () => {
      const getPermissions = await Notifications.getPermissionsAsync();
      if (getPermissions) {
        authContext.setNotificationPermissions(getPermissions);
      }
    };
    checkNotificationPermission();
  }, []);
  //after permission check, open modal if permissions are not granted
  useEffect(() => {
    if (
      authContext.notificationPermissions?.granted &&
      !authContext.onesignalInitialized
    )
      initializeOneSignal();
    if (
      !authContext.notificationPermissions?.granted &&
      authContext.notificationPermissions?.canAskAgain &&
      authContext.settings?.notifications
    )
      setDisclosureModalVisible(true);
  }, [authContext.notificationPermissions, authContext.user]);

  const handleAgree = async () => {
    const settings = await Notifications.requestPermissionsAsync();
    //console.log("request permissions: ", JSON.stringify(settings, null, 2));
    if (settings) authContext.setNotificationPermissions(settings);
    setDisclosureModalVisible(false);
  };
  const handleSkip = () => {
    setDisclosureModalVisible(false);
  };
  const updateLanguage = async (newLang) => {
    // change lang only if its different from current one
    if (newLang !== authContext.settings.lang) {
      let updatedSettings = { ...authContext.settings };
      updatedSettings.lang = newLang;
      //console.log("new lang settings: ", updatedSettings)
      // Call API to update settings
      const result = await updateSettingsApi.updateSettings(updatedSettings);
      //console.log("change lang, settings API:", result.data.settings)
      if (result.ok && result?.data?.settings) {
        // Update settings in context and local storage
        authContext.setSettings(result.data.settings);
        // Change language in i18n
        await i18n.changeLanguage(newLang);
      }
    }
  };
  const toggleSetting = async (newValue, setting) => {
    //check how many safety methods are active before enabling staysafer mode
    if (setting === "confirmed_save") {
      if (count < 2) {
        Toast.show(t("toast error at least 2 methods set"), {
          duration: Toast.durations.LONG,
        });
        return;
      }
    }
    //check notification permission if user wants to enable option
    if (
      setting === "notifications" &&
      newValue &&
      !authContext.notificationPermissions?.granted &&
      authContext.notificationPermissions?.canAskAgain
    )
      setDisclosureModalVisible(true);
    //update settings API
    const updatedSettings = { ...authContext.settings };
    updatedSettings[setting] = newValue;
    const result = await updateSettingsApi.updateSettings(updatedSettings);
    console.log("update settins API: ", JSON.stringify(result, null, 2));
    if (result.ok && result.data?.settings) {
      authContext.setSettings(result.data.settings);
    }
  };
  // navigate to page
  const goToPage = (page) => {
    navigation.navigate(page);
  };

  return (
    <Screen>
      <ProminentDisclosureNotification
        visible={disclosureModalVisible}
        onAgree={handleAgree}
        onSkip={handleSkip}
        onClose={() => setDisclosureModalVisible(false)}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              {t("version")}
              {": "} {Constants.expoConfig.version}
            </Text>
          </View>
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <View>
                <Icon
                  family="fontAwesome5"
                  size={48}
                  style={styles.logoIcon}
                  name="language"
                />
              </View>
              <Text style={styles.title}>
                {t("manage system set language")}
              </Text>
            </View>
            <View style={styles.pickerWrapper}>
              <View style={styles.picker}>
                <RNPickerSelect
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 19,
                      right: 9,
                    },
                  }}
                  Icon={() => {
                    if (Platform.OS === "ios") {
                      return (
                        <FontAwesome6
                          name="caret-down"
                          size={14}
                          color={colors.darkGrey}
                        />
                      );
                    } else null;
                  }}
                  placeholder={{}}
                  value={authContext.settings.lang}
                  onValueChange={(itemValue) => updateLanguage(itemValue)}
                  items={[
                    { label: t("english"), value: "en" },
                    { label: t("italian"), value: "it" },
                    { label: t("french"), value: "fr" },
                    { label: t("german"), value: "de" },
                    { label: t("spanish"), value: "es" },
                    { label: t("portuguese"), value: "pt" },
                  ]}
                />
              </View>
            </View>
          </View>
          {authContext.plan.active && (
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <View>
                  <Icon
                    size={48}
                    style={styles.logoIcon}
                    name="bell-outline"
                    iconColor={
                      authContext.user.role == "collaborator" ||
                      authContext.user.role == "guest"
                        ? colors.lightGrey
                        : colors.darkGrey
                    }
                  />
                </View>
                <Text
                  style={
                    authContext.user.role == "collaborator" ||
                    authContext.user.role == "guest"
                      ? styles.titleFaded
                      : styles.title
                  }
                >
                  {t("system notification header")}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <SystemSetupListItem
                  description={t("system description notification")}
                  value={authContext.settings?.notifications}
                  onValueChange={(value) =>
                    toggleSetting(value, "notifications")
                  }
                  disabled={
                    authContext.user.role == "collaborator" ||
                    authContext.user.role == "guest"
                      ? true
                      : false
                  }
                />
              </View>
            </View>
          )}
          {authContext.user.role == "admin" && authContext.plan.active && (
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <View>
                  <Icon
                    size={48}
                    style={styles.logoIcon}
                    name="speaker-wireless"
                    iconColor={
                      authContext.evacuation?.evacuation_id
                        ? colors.lightGrey
                        : colors.darkGrey
                    }
                  />
                </View>
                <Text
                  style={
                    authContext.evacuation?.evacuation_id
                      ? styles.titleFaded
                      : styles.title
                  }
                >
                  {t("system sound alarm")}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <SystemSetupListItem
                  description={t("system subtitle sound alarm")}
                  value={authContext.settings.sound_alarm}
                  onValueChange={(value) => toggleSetting(value, "sound_alarm")}
                  disabled={
                    authContext.evacuation?.evacuation_id ? true : false
                  }
                />
              </View>
            </View>
          )}
          {authContext.user.role == "admin" && authContext.plan.active && (
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <View>
                  <Icon
                    size={48}
                    style={styles.logoIcon}
                    name="card-account-details-star-outline"
                  />
                </View>
                <Text style={styles.title}>
                  {t("system auto selected header")}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <SystemSetupListItem
                  description={t("system description auto selected")}
                  value={authContext.settings.auto_selected}
                  onValueChange={(value) =>
                    toggleSetting(value, "auto_selected")
                  }
                />
              </View>
            </View>
          )}
          {authContext.user.role == "admin" && authContext.plan.active && (
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <View>
                  <Icon
                    size={48}
                    style={styles.logoIcon}
                    name="alarm-bell"
                    iconColor={
                      authContext.evacuation?.evacuation_id
                        ? colors.lightGrey
                        : colors.darkGrey
                    }
                  />
                </View>
                <Text
                  style={
                    authContext.evacuation?.evacuation_id
                      ? styles.titleFaded
                      : styles.title
                  }
                >
                  {t("system drill as alarm header")}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <SystemSetupListItem
                  description={t("system description drill as alarm")}
                  value={authContext.settings?.drill_as_alarm}
                  onValueChange={(value) =>
                    toggleSetting(value, "drill_as_alarm")
                  }
                  disabled={
                    authContext.evacuation?.evacuation_id ? true : false
                  }
                />
              </View>
            </View>
          )}
          {authContext.user.role == "admin" && authContext.plan.active && (
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <View>
                  <Icon
                    size={48}
                    style={styles.logoIcon}
                    name="map-marker-off"
                    iconColor={
                      authContext.evacuation?.evacuation_id
                        ? colors.lightGrey
                        : colors.darkGrey
                    }
                  />
                </View>
                <Text
                  style={
                    authContext.evacuation?.evacuation_id
                      ? styles.titleFaded
                      : styles.title
                  }
                >
                  {t("system no evac no markers header")}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <SystemSetupListItem
                  description={t("system description no evac no markers")}
                  value={authContext.settings?.no_evac_no_markers}
                  onValueChange={(value) =>
                    toggleSetting(value, "no_evac_no_markers")
                  }
                  disabled={
                    authContext.evacuation?.evacuation_id ? true : false
                  }
                />
              </View>
            </View>
          )}
          {authContext.user.role == "admin" && authContext.plan.active && (
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <View>
                  <Icon
                    size={48}
                    style={styles.logoIcon}
                    name="playlist-remove"
                    iconColor={
                      authContext.evacuation?.evacuation_id
                        ? colors.lightGrey
                        : colors.darkGrey
                    }
                  />
                </View>
                <Text
                  style={
                    authContext.evacuation?.evacuation_id
                      ? styles.titleFaded
                      : styles.title
                  }
                >
                  {t("system no evac no people header")}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <SystemSetupListItem
                  description={t("system description no evac no people")}
                  value={authContext.settings?.no_evac_no_people}
                  onValueChange={(value) =>
                    toggleSetting(value, "no_evac_no_people")
                  }
                  disabled={
                    authContext.evacuation?.evacuation_id ? true : false
                  }
                />
              </View>
            </View>
          )}
          {authContext.user.role == "admin" && authContext.plan.active && (
            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={require("../assets/staysafer_mode.png")}
                    style={styles.logo}
                  />
                </View>
                <Text
                  style={
                    authContext.evacuation?.evacuation_id
                      ? styles.titleFaded
                      : styles.title
                  }
                >
                  {t("system confirmed save")}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <SystemSetupListItem
                  description={t("system subtitle confirmed save")}
                  italic_description={t(`safety methods active`) + `: ${count}`}
                  value={authContext.settings.confirmed_save}
                  onValueChange={(value) =>
                    toggleSetting(value, "confirmed_save")
                  }
                  onPress={() => goToPage("safety methods")}
                  goToManageSafetyMethods={t("manage safety methods")}
                  disabled={
                    authContext.evacuation?.evacuation_id ? true : false
                  }
                />
              </View>
            </View>
          )}
          {authContext.user.role !== "collaborator" &&
            authContext.plan.active && (
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <View>
                    <Icon
                      size={48}
                      style={styles.logoIcon}
                      name="timer-outline"
                      iconColor={
                        authContext.evacuation?.evacuation_id
                          ? colors.lightGrey
                          : colors.darkGrey
                      }
                    />
                  </View>
                  <Text
                    style={
                      authContext.evacuation?.evacuation_id
                        ? styles.titleFaded
                        : styles.title
                    }
                  >
                    {t("header shortcuts")}
                  </Text>
                </View>
                <View style={styles.toggleWrapper}>
                  <SystemSetupArrowItem
                    description={t("setup description shortcuts")}
                    onPress={() => goToPage("shortcuts")}
                    disabled={
                      authContext.evacuation?.evacuation_id ? true : false
                    }
                  />
                </View>
              </View>
            )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 42,
  },
  versionContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  versionText: {
    fontSize: 14,
    color: colors.grey,
  },
  content: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    marginBottom: 0,
  },
  titleContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  imageWrapper: {
    padding: 16,
  },
  logo: {
    width: 20,
    height: 20,
  },
  logoIcon: {
    padding: 8,
  },
  logoIconFaded: {
    padding: 8,
    color: colors.lightGrey,
  },
  title: {
    fontSize: 18,
  },
  titleFaded: {
    fontSize: 18,
    color: colors.lightGrey,
  },
  pickerWrapper: {
    flexGrow: 1,
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: colors.grey,
    borderBottomWidth: 1,
    borderTopColor: colors.grey,
    borderTopWidth: 1,
  },
  toggleWrapper: {
    flexGrow: 1,
    borderTopColor: colors.lightGrey,
    borderTopWidth: 1,
  },
  picker: {
    flex: 1,
    flexGrow: 1,
    width: "100%",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14, // Increase vertical padding
    paddingHorizontal: 8,
    borderWidth: 0,
    borderColor: "gray",
    borderRadius: 0,
    color: "black",
    height: 60, // Ensure enough height for text
    lineHeight: 24, // Improve vertical alignment
    textAlignVertical: "center", // Ensures text stays centered
    paddingRight: 30, // Avoid overlap with icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 14, // Increase vertical padding
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 0,
    color: "black",
    height: 60, // Match iOS height
    lineHeight: 24, // Improve vertical alignment
    textAlignVertical: "center",
    paddingRight: 30,
  },
});

export default ManageSystemScreen;
