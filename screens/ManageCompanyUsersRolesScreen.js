import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import { vh, vw, em, vmin, vmax } from "react-native-expo-viewport-units";
import Icon from "../components/Icon";
import SetupListItem from "../components/SetupListItem";
import ArrowListItem from "../components/ArrowListItem";
import { AuthContext } from "../context/AuthContext";
import cache from "../utility/cache";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import CompanyUsersList from "../components/CompanyUsersList";
import Screen from "../components/Screen";

function ManageCompanyUsersRolesScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (route?.params?.description === "success") {
      // Add a Toast to notify user.
      Toast.show(t("toast description successful"), {
        duration: Toast.durations.LONG,
      });
    }
  }, []);

  return (
    <View style={styles.container}>
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
            <View style={styles.companyUsersContainer}>
              <CompanyUsersList />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lighterGrey,
  },
  companyUsersContainer: {
    flex: 1,
  },
  companyUsersTitle: {
    fontSize: 16,
    marginBottom: 0,
    textAlign: "center",
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ManageCompanyUsersRolesScreen;
