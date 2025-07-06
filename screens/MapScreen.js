import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { vh } from "react-native-expo-viewport-units";
import Screen from "../components/Screen";
import Header from "../components/Header";
import Map from "../components/Map";
import { AuthContext } from "../context/AuthContext";
import NoAlarmMessage from "../components/NoAlarmMessage";
import colors from "../config/color";
import Toast from "react-native-root-toast";
import NoPlanMessage from "../components/NoPlanMessage";
import * as Notifications from "expo-notifications";
import ProminentDisclosureNotification from "../components/ProminentDisclosureNotification";
import useInitOneSignal from "../hooks/useInitOnesignal";
import { useTranslation } from "react-i18next";

function MapScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [disclosureModalVisible, setDisclosureModalVisible] = useState(false);
  const authContext = useContext(AuthContext);
  const { initializeOneSignal } = useInitOneSignal();

  useEffect(() => {
    if (route?.params?.evacStatus === "start") {
      // Add a Toast to notify user.
      Toast.show("Notification body", {
        duration: Toast.durations.LONG,
      });
    }
  }, [route?.params?.evacStatus]);

  const handleAgree = async () => {
    const settings = await Notifications.requestPermissionsAsync();
    if (settings) authContext.setNotificationPermissions(settings);
    setDisclosureModalVisible(false);
  };
  const handleSkip = () => {
    setDisclosureModalVisible(false);
  };
  // check notifications permissions
  useEffect(() => {
    const checkNotificationPermission = async () => {
      const getPermissions = await Notifications.getPermissionsAsync();
      if (getPermissions) {
        authContext.setNotificationPermissions(getPermissions);
      }
    };
    checkNotificationPermission();
  }, []);
  // after permission check, init onesignal or ask permissions
  useEffect(() => {
    if (authContext.notificationPermissions?.granted) {
      initializeOneSignal();
    }
    if (
      !authContext.notificationPermissions?.granted &&
      authContext.notificationPermissions?.canAskAgain &&
      authContext.settings?.notifications &&
      authContext.user?.role === "collaborator"
    ) {
      setDisclosureModalVisible(true);
    }
  }, [authContext.notificationPermissions, authContext.user]);

  return (
    <Screen>
      <ProminentDisclosureNotification
        visible={disclosureModalVisible}
        onAgree={handleAgree}
        onSkip={handleSkip}
        onClose={() => setDisclosureModalVisible(false)}
      />
      <View style={styles.container}>
        <Header />
        {!authContext?.plan?.active && <NoPlanMessage />}
        {authContext.plan?.active && !authContext.evacuation?.evacuation_id && (
          <NoAlarmMessage />
        )}
        {authContext.plan?.active && authContext.evacuation?.evacuation_id && (
          <View style={styles.content}>
            <View style={styles.map}>
              <Map showDistanceStatus={true} />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 240,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
