import React from "react";
import { StyleSheet, View } from "react-native";
import { vh, vw, em, vmin, vmax } from "react-native-expo-viewport-units";
import colors from "../config/color";
import "../config/lang/i18n";
import CompanyInvitesHistoryList from "../components/CompanyInvitesHistoryList";
import Screen from "../components/Screen";

function CompanyInviteHistoryScreen() {
  return (
    <View style={styles.container}>
      <CompanyInvitesHistoryList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CompanyInviteHistoryScreen;
