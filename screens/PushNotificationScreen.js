import React, { useEffect, useContext, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";

function PushNotificationScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container} nestedScrollEnabled={true}>
        {/* <Text>
          Notification permissions:{" "}
          {JSON.stringify(authContext.notificationPermissions, null, 2)}
        </Text>
        <Text>
          Onesignal initalized{" "}
          {JSON.stringify(authContext.onesignalInitialized, null, 2)}
        </Text> */}
        <Text>
          Notification data:{" "}
          {JSON.stringify(authContext.notificationData, null, 2)}
        </Text>
        <Text>
          Nfc tech: {JSON.stringify(authContext.OSDeviceState, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
  },
  scrollContainer: {
    margin: 8,
  },
});

export default PushNotificationScreen;
