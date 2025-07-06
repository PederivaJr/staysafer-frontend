import React, { useContext } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Platform,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import AppOptionMenu from "./OptionMenu";
import OfflineNotice from "./OfflineNotice";
import Constants from "expo-constants";
import colors from "../config/color";
import { useTranslation } from "react-i18next";
import useEndEvent from "../hooks/useEndEvent";

function Header({ icon, navigation, ...otherProps }) {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const { endEvent } = useEndEvent();

  const endOngoingEvent = () => {
    if (authContext.evacuation?.real_event) endEvent("real_event");
    if (authContext.evacuation?.drill) endEvent("drill");
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor:
            authContext.evacuation?.real_event || authContext.evacuation?.drill
              ? colors.darkerGrey
              : colors.brightGreen,
        },
      ]}
    >
      <View style={styles.headerOffline}>
        <OfflineNotice />
      </View>
      <View style={styles.headerIcons}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/notificationIcon.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.alarmStatus}>
          {authContext.evacuation?.real_event && (
            <TouchableOpacity onPress={endOngoingEvent}>
              <MaterialCommunityIcons
                size={40}
                style={styles.alarmOnIcon}
                name="alarm-light-outline"
              />
            </TouchableOpacity>
          )}
          {authContext.evacuation?.drill && (
            <TouchableOpacity
              onPress={
                authContext.user.role !== "collaborator" &&
                authContext.user.role !== "guest"
                  ? endOngoingEvent
                  : null
              }
            >
              <MaterialCommunityIcons
                size={40}
                style={
                  authContext.settings?.drill_as_alarm &&
                  authContext.user.role === "collaborator"
                    ? styles.alarmOnIcon
                    : styles.alarmDrillOnIcon
                }
                name={
                  authContext.settings?.drill_as_alarm &&
                  authContext.user.role === "collaborator"
                    ? "alarm-light-outline"
                    : "test-tube"
                }
              />
            </TouchableOpacity>
          )}
        </View>
        <AppOptionMenu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  headerOffline: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerIcons: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
  },
  logoIcon: {
    marginHorizontal: 0,
    color: colors.darkerGrey,
  },
  logoContainer: {
    marginLeft: 18,
  },
  logo: {
    width: 24,
    height: 24,
  },
  alarmStatus: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  alarmOnIcon: {
    color: colors.red,
  },
  alarmDrillOnIcon: {
    color: colors.yellow,
  },
  alarmOffIcon: {
    color: colors.brightGreen,
  },
});

export default Header;
