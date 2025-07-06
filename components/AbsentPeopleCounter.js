import React, { useContext } from "react";
import { StyleSheet, Text } from "react-native";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";

function AbsentPeopleCounter() {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  const absentContacts = authContext.selectedUsersCheckins?.filter(
    (contact) => contact.checkins.absent.active
  );
  return (
    <Text style={styles.text}>
      {t("absent")}: {absentContacts?.length ? absentContacts.length : 0}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.darkGrey,
    fontSize: 18,
    fontWeight: "normal",
  },
});

export default AbsentPeopleCounter;
