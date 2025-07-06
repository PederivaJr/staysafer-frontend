import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { AuthContext } from "../context/AuthContext";
import createCheckinApi from "../api/createCheckin";
import Toast from "react-native-root-toast";
import { useTranslation } from "react-i18next";
import Screen from "../components/Screen";
import Header from "../components/Header";
import RoundedIcon from "../components/RoundedIcon";
import colors from "../config/color";
import "../config/lang/i18n";
import { vh } from "react-native-expo-viewport-units";

function ManageNFCScreen() {
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [nfcTagDetected, setNfcTagDetected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanFailed, setIsScanFailed] = useState(false);
  const [tag, setTag] = useState(null);
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  // Initializes NFC manager on component mount and cleans up on unmount.
  useEffect(() => {
    NfcManager.start();

    return () => {
      NfcManager.cancelTechnologyRequest();
    };
  }, []);

  // Asynchronous function to handle the NFC reading process.
  const readNFC = async () => {
    // Setting scanning state and resetting detection and failure states.
    setIsScanning(true);
    setNfcTagDetected(false);
    setIsScanFailed(false);
    try {
      // Requests NFC technology to be ready for reading.
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      console.log("tag is: ", JSON.stringify(tag));
      // Processing NFC tag data. slice 3 removed lang code from start
      let message = tag?.ndefMessage[0].payload
        .reduce((msg, byte) => msg + String.fromCharCode(byte), "")
        .slice(3);
      // If the tag contains specific content, update the state accordingly.
      if (message) {
        setTag(message);
        // get evac list based on event type (alarm, drill)
        let evacList = null;
        if (authContext.evacuation.real_event) {
          evacList = authContext.evacLists?.find((list) =>
            list.name.includes("alarm")
          );
        }
        if (authContext.evacuation.drill) {
          evacList = authContext.evacLists?.find((list) =>
            list.name.includes("drill")
          );
        }
        // API call to register an NFC check-in for the user.
        const checkin = {
          checkin_type: "nfc",
          checkin_date: new Date(),
          evac_point_id: authContext.markersWithDistance[0]?.evac_point_id
            ? authContext.markersWithDistance[0].evac_point_id
            : null,
          user_id: authContext.user.id,
          list_id: authContext.evacuation.list_id,
        };
        // Making the API call and handling the response.
        const result = await createCheckinApi.createCheckin(checkin);
        console.log("nfc API response: ", result);
        // Handling API call failure by displaying an error message.
        if (!result.ok) {
          setIsScanFailed(true);
          return;
        }
        if (result.ok) {
          if (result.data?.selected_users)
            authContext.setSelectedUsers(result.data.selected_users);
          if (result.data?.selected_users_checkins)
            authContext.setSelectedUsersCheckins(
              result.data.selected_users_checkins
            );
          // Successfully detected and processed an NFC tag.
          setNfcTagDetected(true);
        }
      }
    } catch (error) {
      // Handling any errors during the NFC read process.
      console.warn("Oops!", JSON.stringify(error.message, null, 2));
      setIsScanFailed(true);
    } finally {
      // Cleanup after NFC scanning, regardless of the outcome.
      NfcManager?.cancelTechnologyRequest();
      setIsScanning(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          {/* {!nfcAvailable && (
            <>
              <RoundedIcon
                size={120}
                name="nfc-variant-off"
                color={colors.grey}
                backgroundColor="#fafafa"
              />
              <Text style={styles.textScanning}>{t("nfc not active")}</Text>
            </>
          )} */}
          {isScanning ? (
            <>
              <RoundedIcon
                size={120}
                name="cellphone-nfc"
                color="#999"
                backgroundColor="#fafafa"
              />
              <Text style={styles.textScanning}>{t("nfc scanning")}.</Text>
            </>
          ) : nfcTagDetected ? (
            <>
              <RoundedIcon
                size={120}
                name="check"
                color={colors.brightGreen}
                backgroundColor="#fafafa"
              />
              <Text style={styles.textSuccess}>{t("nfc safe")}</Text>
              {tag && (
                <Text style={styles.textInfo}>
                  {t("manage map evac point title")}
                  {": "}
                  {tag}
                </Text>
              )}
            </>
          ) : (
            <>
              <RoundedIcon
                size={120}
                name="nfc"
                color={colors.white}
                backgroundColor={colors.darkGrey}
                onPress={readNFC}
              />
              <Text style={styles.text}>{t("nfc click icon and scan")}</Text>
              {isScanFailed && (
                <Text style={styles.textError}>{t("nfc invalid tag")}</Text>
              )}
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
    minHeight: vh(100),
  },
  content: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    fontSize: 24,
    color: colors.darkGrey,
  },
  textError: {
    marginTop: 16,
    fontSize: 24,
    color: colors.red,
  },
  textInfo: {
    marginTop: 16,
    fontSize: 24,
    color: colors.grey,
  },
  textSuccess: {
    marginTop: 16,
    fontSize: 24,
    color: colors.brightGreen,
  },
  textScanning: {
    marginTop: 16,
    fontSize: 24,
    color: colors.grey,
  },
});

export default ManageNFCScreen;
