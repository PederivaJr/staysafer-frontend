import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import { vh, vw, em, vmin, vmax } from "react-native-expo-viewport-units";
import Icon from "../components/Icon";
import ArrowListItem from "../components/ArrowListItem";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import useCompanyUsers from "../hooks/useCompanyUsers";

function CompanyUsersScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  // ✅ NEW: Real-time hooks that replace useInitData functionality
  useCompanyUsers(); // Updates user roles, company users, and evac points in real-time

  useEffect(() => {
    if (route?.params?.description === "success") {
      // Add a Toast to notify user.
      Toast.show(t("toast description successful"), {
        duration: Toast.durations.LONG,
      });
    }
  }, []);

  const goToPage = (page) => {
    navigation.navigate(page);
  };

  return (
    <View>
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
        <View style={styles.container}>
          {authContext.user.role == "admin" && (
            <ArrowListItem
              ImageComponent={
                <Icon
                  name="account-hard-hat"
                  size={64}
                  backgroundColor="transparent"
                  iconColor={colors.grey}
                />
              }
              title={t("invite title roles")}
              description={t("invite description roles")}
              onPress={() => goToPage("company manage roles")}
            />
          )}
          <ArrowListItem
            ImageComponent={
              <Icon
                name="mailbox-up"
                size={64}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={
              t("invite title list") +
              " " +
              "(" +
              authContext.pendingInvites?.length +
              ")"
            }
            description={t("invite description list")}
            onPress={() => goToPage("company pending invites")}
          />
          {authContext.user.role !== "guest" &&
            authContext.user.role !== "collaborator" && (
              <ArrowListItem
                ImageComponent={
                  <Icon
                    name="qrcode-plus"
                    size={64}
                    backgroundColor="transparent"
                    iconColor={colors.grey}
                  />
                }
                title={t("invite title show qr")}
                description={t("invite description show qr")}
                onPress={() => goToPage("show qr")}
              />
            )}
          {authContext.user.role !== "guest" &&
            authContext.user.role !== "collaborator" && (
              <ArrowListItem
                ImageComponent={
                  <Icon
                    name="email-plus-outline"
                    size={64}
                    backgroundColor="transparent"
                    iconColor={colors.grey}
                  />
                }
                title={t("invite title mail")}
                description={t("invite description mail")}
                onPress={() => goToPage("company invite mail")}
              />
            )}
          <ArrowListItem
            ImageComponent={
              <Icon
                name="qrcode-scan"
                size={64}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("invite title scan qr")}
            description={t("invite description scan qr")}
            onPress={() => goToPage("scan qr")}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  companyUsersContainer: {
    flex: 1,
    margin: 0,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  companyUsersTitle: {
    fontSize: 16,
    marginBottom: 0,
    textAlign: "center",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.lighterGrey,
    minHeight: vh(100),
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
  },
  map: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.grey,
    minHeight: vh(50),
    width: "100%",
  },
  modalContainer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  modalContent: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: colors.lightGrey,
    padding: 16,
  },
  closeModalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginBottom: 32,
    width: "100%",
  },
  modalTitleContainer: {
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
  },
});

export default CompanyUsersScreen;
