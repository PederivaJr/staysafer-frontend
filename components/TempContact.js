import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import cache from "../utility/cache";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";
import OptionMenuTempContact from "./OptionMenuTempContact";
import deleteTempContactApi from "../api/deleteTempContact";
import recreateTempContactApi from "../api/recreateTempContact";
import { COMPARE_NAMES } from "../config/globals";
import { stubObject } from "lodash";

const TempContact = ({ contact }) => {
  const authContext = useContext(AuthContext);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [count, setCount] = useState(null);

  //console.log("contact temp: ", JSON.stringify(contact, null, 2));
  // count how many temp users for this temp contact are in the selected list
  useEffect(() => {
    const countMatches = () => {
      let evacList = authContext.evacLists?.find(
        (list) => list.list_id === contact.list_id
      );
      let inSelectedList = [];
      if (evacList.name.includes("alarm")) {
        inSelectedList = authContext.selectedUsers?.filter(
          (user) => user.temp_id == contact.temp_id
        ).length;
      }
      if (evacList.name.includes("drill")) {
        inSelectedList = authContext.selectedUsersDrill?.filter(
          (user) => user.temp_id == contact.temp_id
        )?.length;
      }

      if (!inSelectedList) return 0;
      return inSelectedList;
    };
    setCount(countMatches());
  }, [authContext.selectedUsers, authContext.selectedUsersDrill]);
  // handle option menu actions
  const handleAction = async (action) => {
    if (action === "edit") {
      //navigate to edit screen
      navigation.navigate("edit temp contact", { contact: contact });
    }
    if (action === "remove") {
      // Handle removing the user from the company
      const result = await deleteTempContactApi.deleteTempContact(
        contact.temp_id,
        contact.list_id
      );
      console.log("remove temp contact API: ", JSON.stringify(result, null, 2));
      if (result.ok) {
        const sortedTempContacts = result.data.temp_contacts;
        if (sortedTempContacts && sortedTempContacts?.length > 0)
          sortedTempContacts.sort(COMPARE_NAMES);
        authContext.setTempContacts(sortedTempContacts);
        if (result.data?.selected_users) {
          let evacList = authContext.evacLists?.find(
            (list) => list.list_id === contact.list_id
          );
          console.log("add contact evac list: ", evacList);
          if (evacList.name.includes("alarm"))
            authContext.setSelectedUsers(result.data.selected_users);
          if (evacList.name.includes("drill"))
            authContext.setSelectedUsersDrill(result.data.selected_users);
        }
      }
      if (!result.ok && result.data.error_code) {
        Toast.show(t(result.data.error_code), {
          duration: Toast.durations.LONG,
        });
      }
      if (!result.ok && !result.data.error_code) {
        Toast.show(t("toast error general"), {
          duration: Toast.durations.LONG,
        });
      }
    }
    if (action === "recreate") {
      const data = {
        temp_id: contact.temp_id,
        list_id: contact.list_id,
      };
      const result = await recreateTempContactApi.recreateTempContact(data);
      console.log(
        "recreate temp contact API: ",
        JSON.stringify(result, null, 2)
      );

      if (result.ok) {
        const sortedTempContacts = result.data.temp_contacts;
        if (sortedTempContacts && sortedTempContacts?.length > 0)
          sortedTempContacts.sort(COMPARE_NAMES);
        authContext.setTempContacts(sortedTempContacts);
        if (result.data?.selected_users) {
          let evacList = authContext.evacLists?.find(
            (list) => list.list_id === contact.list_id
          );
          //console.log("add contact evac list: ", evacList);
          if (evacList.name.includes("alarm"))
            authContext.setSelectedUsers(result.data.selected_users);
          if (evacList.name.includes("drill"))
            authContext.setSelectedUsersDrill(result.data.selected_users);
        }
        if (result?.data?.selected_users_checkins)
          authContext.setSelectedUsersCheckins(
            result.data.selected_users_checkins
          );
        Toast.show(t("toast temp user recreated"), {
          duration: Toast.durations.LONG,
        });
      }
      if (!result.ok && result.data.error_code) {
        Toast.show(t(result.data.error_code), {
          duration: Toast.durations.LONG,
        });
      }
      if (!result.ok && !result.data.error_code) {
        Toast.show(t("toast error general"), {
          duration: Toast.durations.LONG,
        });
      }
    }
  };

  return (
    <View style={styles.contactCon}>
      <View style={styles.placeholder}>
        {contact.temp_id && contact.expires_in?.expire_date && (
          <Image
            style={styles.contactImg}
            source={require("../assets/temp_user.png")}
          />
        )}
        {contact.temp_id && !contact.expires_in?.expire_date && (
          <Image
            style={styles.localImg}
            source={require("../assets/user.jpg")}
          />
        )}
      </View>
      <View style={styles.contactData}>
        <Text style={styles.name}>
          {contact.name ? contact.name : null}{" "}
          {contact.count ? `( ${contact.count} ) ` : null}
        </Text>
        {contact.phoneNumbers.length > 0 && (
          <Text style={styles.phoneNumber}>
            {t("profile phone")}
            {": "}
            {contact.phoneNumbers[0].number}
          </Text>
        )}
        {contact.expires_in && contact.expires_in.period !== "never" && (
          <Text style={styles.phoneNumber}>
            {t("expire date")}
            {": "}
            {contact.expires_in.expire_date}
            {contact.expires_in?.expire_date ? " " : null}
            {contact.expires_in?.period ? "(" : null}
            {contact.expires_in.number === 0 &&
            contact.expires_in?.period === "hours"
              ? "< 1 " + t("hour")
              : contact.expires_in.number > 0
                ? `${contact.expires_in.number} ${t(contact.expires_in.period)}`
                : null}
            {contact.expires_in?.period ? ")" : null}
          </Text>
        )}
        <Text style={styles.phoneNumber}>
          {t("in selected users list")}
          {": "}
          {count}
          {"/"}
          {contact.count}
        </Text>
      </View>
      <View style={styles.selectedIcon}>
        <OptionMenuTempContact onSelectAction={handleAction} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contactCon: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  imgContainer: {},
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: 30,
    borderColor: colors.grey,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  contactImg: {
    width: 40,
    height: 40,
    opacity: 0.7,
  },
  localImg: {
    width: 24,
    height: 24,
    opacity: 1,
  },
  contactData: {
    flexGrow: 6,
    flex: 1,
    justifyContent: "center",
    paddingLeft: 8,
  },
  txt: {
    fontSize: 18,
    color: colors.darkGrey,
  },
  name: {
    fontSize: 16,
    color: colors.darkGrey,
  },
  phoneNumber: {
    color: colors.grey,
  },
  selectedIcon: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 8,
  },
});

export default TempContact;
