import React, { useState, useEffect, useContext } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import createCompanyInviteQrApi from "../api/createCompanyInviteQr";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import { useTranslation } from "react-i18next";
import RoundedIcon from "../components/RoundedIcon";
import ProminentDisclosureCamera from "../components/ProminentDisclosureCamera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { COMPARE_ID, COMPARE_NAMES } from "../config/globals";

const CompanyInviteScanQrScreen = ({ navigation }) => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [disclosureModalVisible, setDisclosureModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleAgree = async () => {
    await requestPermission();
    setHasPermission(permission?.granted || false);
    setDisclosureModalVisible(false);
  };

  const handleSkip = () => {
    setHasPermission(false);
    setDisclosureModalVisible(false);
  };

  // manage permissions modal
  useEffect(() => {
    if (permission) {
      if (permission.granted) {
        setHasPermission(true);
      } else if (!permission.granted && permission.canAskAgain) {
        setDisclosureModalVisible(true);
      } else {
        setHasPermission(false);
      }
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }) => {
    //console.log("scanned: ", data);
    setScanned(true);
    const [userId, companyId] = data.split("-");
    if (userId && companyId) {
      const abortController = new AbortController();
      const result = await createCompanyInviteQrApi.createCompanyInviteQr(
        { company_id: parseInt(companyId), sended_by: parseInt(userId) },
        { signal: abortController.signal }
      );
      console.log("scan qr API: ", JSON.stringify(result, null, 2));
      if (result.ok) {
        setScanSuccess(true);
        if (result.data?.invites) {
          const sortedInvites = result.data.invites.sort(COMPARE_ID);
          authContext.setPendingInvites(sortedInvites);
        }
        if (result.data?.company_users) {
          const sortedUsers = result.data.company_users.sort(COMPARE_NAMES);
          authContext.setCompanyUsers(sortedUsers);
        }
        if (result.data?.user) authContext.setUser(result.data.user);
        Toast.show(t("toast invite managed successfully"), {
          duration: Toast.durations.LONG,
        });
      }
      if (
        !result.ok &&
        result.data.message.includes("is already part of this company")
      ) {
        Toast.show(t(result.data.message), {
          duration: Toast.durations.LONG,
        });
      }
      if (
        !result.ok &&
        !result.data.message.includes("is already part of this company")
      ) {
        Toast.show(t("toast error general"), {
          duration: Toast.durations.LONG,
        });
      }

      return () => abortController.abort();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.centerMessage}>
          {t("invite camera permissions")}
        </Text>
        <ProminentDisclosureCamera
          visible={disclosureModalVisible}
          onAgree={handleAgree}
          onSkip={handleSkip}
          onClose={() => setDisclosureModalVisible(false)}
        />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.noPermissions}>
          <MaterialCommunityIcons
            name="camera-off"
            size={80}
            color={colors.grey}
          />
          <Text style={styles.centerMessage}>{t("invite camera access")}</Text>
        </View>
      </View>
    );
  }

  if (scanSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <RoundedIcon
            name="check"
            color={colors.brightGreen}
            size={120}
            backgroundColor={colors.lighterGrey}
          />
          <View style={styles.textContainer}>
            <Text style={styles.noAlarmText}>{t("new company joined")}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("invite scan qr description")}</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [Camera.Constants?.BarCodeType?.qr || "qr"],
          }}
          style={styles.camera}
        />
      </View>
      {scanned && (
        <View style={styles.scanAgain}>
          <Button
            style={styles.scanAgainButton}
            title={t("invite scan again")}
            onPress={() => setScanned(false)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 64,
  },
  scanAgain: {
    margin: 16,
  },
  scanAgainButton: {
    padding: 24,
  },
  centerMessage: {
    textAlign: "center",
    fontSize: 18, // Ensure this is a valid number
    marginTop: 8,
    color: colors.darkGrey,
  },
  title: {
    fontSize: 24, // Ensure this is a valid number
    marginVertical: 32,
    textAlign: "center",
  },
  cameraContainer: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
  },
  noPermissions: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  camera: {
    flex: 1,
  },
  noAlarm: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    paddingVertical: 60,
  },
  textContainer: {
    paddingVertical: 16,
  },
  noAlarmText: {
    fontSize: 24, // Ensure this is a valid number
    textAlign: "center",
  },
});

export default CompanyInviteScanQrScreen;
