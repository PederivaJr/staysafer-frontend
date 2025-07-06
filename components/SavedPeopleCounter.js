import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, Image, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import "../config/lang/i18n";
import { useSSR, useTranslation } from "react-i18next";

function SavedPeopleCounter() {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [savedUsers, setSavedUsers] = useState([]);
  const [notAbsentUsers, setNotAbsentUsers] = useState([]);

  // Check if confirmed_save setting is active
  const isConfirmedSave = authContext.settings?.confirmed_save === true;
  useEffect(() => {
    // Determine the saved users based on the new logic
    const getSavedUsers = authContext.selectedUsersCheckins?.filter(
      (contact) => {
        if (!contact.checkins) return false;

        const activeCheckins = Object.values(contact.checkins).filter(
          (checkin) => checkin.active
        );

        // If confirmed_save is active, check for at least 2 active check-ins
        if (isConfirmedSave) {
          return (
            (contact.user_id &&
              activeCheckins?.length >= 2 &&
              !contact?.checkins?.absent?.active) ||
            (!contact.user_id &&
              activeCheckins?.length >= 1 &&
              !contact?.checkins?.absent?.active)
          );
        }
        // If confirmed_save is not active, check for at least 1 active check-in
        return (
          activeCheckins?.length >= 1 && !contact?.checkins?.absent?.active
        );
      }
    );
    const usersNotAbsent = authContext.selectedUsersCheckins?.filter(
      (contact) => !contact?.checkins?.absent?.active
    );
    setSavedUsers(getSavedUsers);
    setNotAbsentUsers(usersNotAbsent);
  }, [authContext.selectedUsersCheckins]);

  return (
    <View style={styles.logoContainer}>
      <Text style={styles.text}>
        {t("safe")}: {savedUsers?.length ? savedUsers?.length : 0}/
        {notAbsentUsers?.length ? notAbsentUsers?.length : 0}
      </Text>
      {isConfirmedSave && (
        <Image
          source={require("../assets/staysafer_mode.png")}
          style={styles.logo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    marginLeft: 0,
  },
  text: {
    color: colors.darkGrey,
    fontSize: 18,
    fontWeight: "normal",
  },
  logo: {
    width: 16,
    height: 16,
  },
});

export default SavedPeopleCounter;
