import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import { vh } from "react-native-expo-viewport-units";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import getProfileApi from "../api/getProfile";
import cache from "../utility/cache";

const CompanyInviteQrScreen = ({ route }) => {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const companyId = authContext.user.company_id;

  // Combine the user ID and company ID to generate a unique code for the QR
  const qrData = `${authContext.user.id}-${companyId}`;

  if (!authContext.user?.company_id) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={colors.brightGreen}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          {t("invite show qr description")}
          {authContext.profile?.company?.name &&
          authContext.profile.company.name !== "no company"
            ? authContext.profile.company.name
            : t("this company")}
        </Text>
        <Text style={styles.subtitle}>{t("invite show qr description 2")}</Text>
      </View>
      <QRCode value={qrData} size={260} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 0,
    paddingTop: 32,
    paddingBottom: 48,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: colors.darkGrey,
  },
});

export default CompanyInviteQrScreen;
