import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import cache from "../utility/cache";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";
import OptionMenuLocalContact from "./OptionMenuLocalContact";
import deleteLocalContactApi from "../api/deleteLocalContact";
import { COMPARE_NAMES } from "../config/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import createUserToListApi from "../api/createUserToList";
import deleteUserToListApi from "../api/deleteUserToList";

const LocalContact = ({ contact, onContactToggle, filter }) => {
  const authContext = useContext(AuthContext);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(false);

  const handleAction = async (action) => {
    if (action === "edit") {
      //navigate to edit screen
      navigation.navigate("edit local contact", { contact: contact });
    }
    if (action === "remove") {
      // Handle removing the user from the company
      const result = await deleteLocalContactApi.deleteLocalContact(
        contact.contact_id,
        contact.list_id
      );
      console.log("remove temp contact API: ", JSON.stringify(result, null, 2));
      if (result.ok) {
        const sortedLocalContacts = result.data.local_contacts;
        if (sortedLocalContacts && sortedLocalContacts?.length > 0)
          sortedLocalContacts.sort(COMPARE_NAMES);
        authContext.setLocalContacts(sortedLocalContacts);
        if (result?.data?.selected_users)
          authContext.setSelectedUsers(result.data.selected_users);
        /* Toast.show(t("toast temp user removed"), {
          duration: Toast.durations.LONG,
        }); */
      }
    }
  };
  useEffect(() => {
    const contactIsSelected = authContext.selectedUsers?.some(
      (item) =>
        (item.phone_id && contact.id && item.phone_id == contact.id) ||
        (item.contact_id &&
          contact.contact_id &&
          item.contact_id == contact.contact_id) ||
        (item.user_id && contact.user_id && item.user_id == contact.user_id) ||
        (item.temp_id && contact.temp_id && item.temp_id == contact.temp_id) ||
        (item.user_to_list_id &&
          contact.user_to_list_id &&
          item.user_to_list_id == contact.user_to_list_id)
    );

    setSelected(contactIsSelected);
  }, [
    authContext.selectedUsers,
    authContext.companyUsers,
    authContext.localContacts,
    authContext.tempContacts,
    contact,
  ]);
  const addContactToSelected = async (contact) => {
    if (
      authContext.plan.company_max_evac_people -
        authContext.selectedUsers?.length ==
      0
    ) {
      // TODO Notify user about plan limit reached
      return;
    }

    const alreadyExist = authContext.selectedUsers?.some(
      (item) =>
        (item.phone_id && contact.id && item.phone_id == contact.id) ||
        (item.contact_id &&
          contact.contact_id &&
          item.contact_id == contact.contact_id) ||
        (item.user_id && contact.user_id && item.user_id == contact.user_id) ||
        (item.user_to_list_id &&
          contact.user_to_list_id &&
          item.user_to_list_id == contact.user_to_list_id) ||
        (item.temp_id && contact.temp_id && item.temp_id == contact.temp_id)
    );

    if (!alreadyExist) {
      // Call API to add selected user
      const result = await createUserToListApi.createUserToList(
        contact,
        authContext.token?.auth
      );
      console.log("add selected: ", JSON.stringify(result, null, 2));
      if (!result.ok && result.data?.error_code) {
        Toast.show(t(result.data.error_code), {
          duration: Toast.durations.SHORT,
        });
      }
      if (!result.ok && result.data.error_code === "err_token_1") {
        // token expired, logout user
        await logout();
        Toast.show(t(result.data.error_code), {
          duration: Toast.durations.LONG,
        });
        return;
      }
      if (!result.ok && !result.data?.error_code) {
        Toast.show(t("toast error general"), {
          duration: Toast.durations.SHORT,
        });
      }
      if (result.ok) {
        if (result.data?.local_contacts)
          authContext.setLocalContacts(result.data.local_contacts);
        if (result.data?.selected_users)
          authContext.setSelectedUsers(result.data.selected_users);
        if (result.data?.selected_users_checkins)
          authContext.setSelectedUsersCheckins(
            result.data.selected_users_checkins
          );

        // Notify the parent component to update the filtered contact list
        onContactToggle(contact.contact_id, true);
        Toast.show(t("toast selected user added"), {
          duration: Toast.durations.SHORT,
        });
      }
    }
  };
  const removeContactFromSelected = async (contact) => {
    if (authContext.evacuation?.real_event || authContext.evacuation?.drill) {
      Toast.show(t("toast cant remove selected"), {
        duration: Toast.durations.SHORT,
      });
      return;
    }
    // Call API to remove selected user
    const result = await deleteUserToListApi.deleteUserToList(contact);
    console.log("remove selected: ", JSON.stringify(result, null, 2));
    if (result.ok) {
      if (result.data?.local_contacts)
        authContext.setLocalContacts(result.data.local_contacts);
      if (result.data?.selected_users)
        authContext.setSelectedUsers(result.data.selected_users);
      if (result.data?.selected_users_checkins)
        authContext.setSelectedUsersCheckins(
          result.data.selected_users_checkins
        );
      //setSelected(false);
      // Notify the parent component to update the filtered contact list
      onContactToggle(contact.id, false);
      Toast.show(t("toast selected user removed"), {
        duration: Toast.durations.SHORT,
      });
    }
  };
  const toggleSelected = async () => {
    if (!selected) {
      await addContactToSelected(contact);
    } else {
      await removeContactFromSelected(contact);
    }
  };

  if (selected && filter !== "selected") {
    return;
  }

  if (
    (selected && filter == "selected") ||
    (!selected && filter !== "selected")
  ) {
    return (
      <View style={styles.contactCon}>
        <View style={styles.leftContainer}>
          {!contact.user_id && !contact?.image?.uri && (
            <Image
              style={styles.contactImg}
              source={require("../assets/user.jpg")}
            />
          )}
        </View>
        <TouchableOpacity style={styles.midContainer} onPress={toggleSelected}>
          <View>
            <Text style={styles.name}>
              {contact.name ? contact.name : null}{" "}
              {contact.phoneNumbers?.length > 0 ? (
                <MaterialCommunityIcons name="phone" size={14} />
              ) : null}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.rightContainer}>
          <OptionMenuLocalContact onSelectAction={handleAction} />
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  contactCon: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  imgContainer: {},
  leftContainer: {
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
  midContainer: {
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
  },
  rightContainer: {},
  contactImg: {
    width: 24,
    height: 24,
    opacity: 1,
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
});

export default LocalContact;
