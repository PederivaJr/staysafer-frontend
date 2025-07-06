import React, { useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { vh } from "react-native-expo-viewport-units";
import colors from "../config/color";
import "../config/lang/i18n";
import CompanyPendingInvitesList from "../components/CompanyPendingInvitesList";
import OptionMenuPendingInvites from "../components/OptionMenuPendingInvites";

function ManageCompanyPendingInvitesScreen() {
  const [loading, setLoading] = useState(false);

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
          <View style={styles.historyContainer}>
            <OptionMenuPendingInvites />
          </View>
          <View style={styles.companyUsersContainer}>
            <CompanyPendingInvitesList />
          </View>
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
    justifyContent: "center",
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  companyUsersTitle: {
    fontSize: 16,
    margin: 8,
    textAlign: "right",
  },
  historyContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
    padding: 8,
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
  },

  noInvitesText: {
    fontSize: 18,
    color: colors.darkGrey,
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

export default ManageCompanyPendingInvitesScreen;
