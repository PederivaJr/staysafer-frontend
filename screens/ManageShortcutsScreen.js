import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  SafeAreaView,
} from "react-native";
import Icon from "../components/Icon";
import SetupListItem from "../components/SetupListItem";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import updateSettingsApi from "../api/updateSettings";
import { ScrollView } from "react-native-gesture-handler";
import Screen from "../components/Screen";

function ManageShortcutsScreen() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  // call API to update settings
  const toggleOption = async (option, value) => {
    let updatedSettings = { ...authContext.settings };
    updatedSettings.shortcuts[option] = value;
    //update settings
    const result = await updateSettingsApi.updateSettings(updatedSettings);
    console.log("shortcuts settings API: ", JSON.stringify(result, null, 2));
    if (result.ok && result.data?.settings) {
      authContext.setSettings(result.data.settings);
    }
  };

  return (
    <Screen>
      {loading && (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator
            animating={loading}
            size="large"
            color={colors.brightGreen}
          />
        </View>
      )}
      {!loading && (
        <View>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View>
              <Text style={styles.title}>
                {t("enable shortcuts you want to see in home screen")}
              </Text>
            </View>
            <SetupListItem
              ImageComponent={
                <Icon
                  name="alarm-light-outline"
                  size={64}
                  backgroundColor={colors.white}
                  iconColor={colors.grey}
                  border={colors.grey}
                />
              }
              subtitle={t("start title alarm")}
              value={authContext?.settings?.shortcuts?.alarm}
              onValueChange={(value) => toggleOption("alarm", value)}
            />
            <SetupListItem
              ImageComponent={
                <Icon
                  name="test-tube"
                  size={64}
                  backgroundColor={colors.white}
                  iconColor={colors.grey}
                  border={colors.grey}
                />
              }
              subtitle={t("start title drill alarm")}
              value={authContext?.settings?.shortcuts?.drill}
              onValueChange={(value) => toggleOption("drill", value)}
            />
            <SetupListItem
              ImageComponent={
                <View style={styles.doubleIcon}>
                  <View style={styles.doubleIconLeft}>
                    <Icon
                      name="exit-run"
                      size={64}
                      backgroundColor="transparent"
                      iconColor={colors.grey}
                      rotate={true}
                    />
                  </View>
                  <View style={styles.doubleIconRight}>
                    <Icon
                      name="alarm-light-outline"
                      size={32}
                      backgroundColor="transparent"
                      iconColor={colors.grey}
                      rotate={false}
                    />
                  </View>
                </View>
              }
              subtitle={t("start title selected")}
              value={authContext?.settings?.shortcuts?.evac_list}
              onValueChange={(value) => toggleOption("evac_list", value)}
              disabled={false}
            />
            <SetupListItem
              ImageComponent={
                <View style={styles.doubleIcon}>
                  <View style={styles.doubleIconLeft}>
                    <Icon
                      name="exit-run"
                      size={64}
                      backgroundColor="transparent"
                      iconColor={colors.grey}
                      rotate={true}
                    />
                  </View>
                  <View style={styles.doubleIconRight}>
                    <Icon
                      name="test-tube"
                      size={32}
                      backgroundColor="transparent"
                      iconColor={colors.grey}
                      rotate={false}
                    />
                  </View>
                </View>
              }
              subtitle={t("start title selected drill")}
              value={authContext?.settings?.shortcuts?.evac_list_drill}
              onValueChange={(value) => toggleOption("evac_list_drill", value)}
              disabled={false}
            />
            <SetupListItem
              ImageComponent={
                <Icon
                  name="map-marker"
                  size={64}
                  backgroundColor={colors.white}
                  iconColor={colors.grey}
                  border={colors.grey}
                />
              }
              subtitle={t("start title evac point")}
              value={authContext?.settings?.shortcuts?.evac_points}
              onValueChange={(value) => toggleOption("evac_points", value)}
              disabled={false}
            />
            <SetupListItem
              ImageComponent={
                <Icon
                  name="account-hard-hat"
                  size={64}
                  backgroundColor={colors.white}
                  iconColor={colors.grey}
                  border={colors.grey}
                />
              }
              subtitle={t("start title company")}
              value={authContext?.settings?.shortcuts?.company_users}
              onValueChange={(value) => toggleOption("company_users", value)}
              disabled={false}
            />
            <SetupListItem
              ImageComponent={
                <Icon
                  name="mailbox-up"
                  size={64}
                  backgroundColor={colors.white}
                  iconColor={colors.grey}
                  border={colors.grey}
                />
              }
              subtitle={t("start title invites")}
              value={authContext?.settings?.shortcuts?.response_invites}
              onValueChange={(value) => toggleOption("response_invites", value)}
              disabled={false}
            />
            <SetupListItem
              ImageComponent={
                <Icon
                  name="arrow-decision"
                  size={64}
                  backgroundColor={colors.white}
                  iconColor={colors.grey}
                  border={colors.grey}
                />
              }
              subtitle={t("start title directions")}
              value={authContext?.settings?.shortcuts?.directions}
              onValueChange={(value) => toggleOption("directions", value)}
              disabled={false}
            />
            <SetupListItem
              ImageComponent={
                <Icon
                  name="cog-outline"
                  size={64}
                  backgroundColor={colors.white}
                  iconColor={colors.grey}
                  border={colors.grey}
                />
              }
              subtitle={t("start title system")}
              value={authContext.settings?.shortcuts?.system_settings}
              onValueChange={(value) => toggleOption("system_settings", value)}
              disabled={false}
            />
          </ScrollView>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.lighterGrey,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 42,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  scroll: {
    flex: 1,
  },
  shareIcon: {
    marginRight: 16,
    color: colors.grey,
  },
  title: {
    textAlign: "left",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doubleIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "relative",
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 32,
  },
  doubleIconLeft: {},
  doubleIconRight: {
    position: "absolute",
    left: 34,
  },
});

export default ManageShortcutsScreen;
