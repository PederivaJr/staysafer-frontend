import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import cache from "../utility/cache";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import createUserToListApi from "../api/createUserToList";
import deleteUserToListApi from "../api/deleteUserToList";

const EvacContact = ({ contact, onContactToggle, filter }) => {
  const [selected, setSelected] = useState(false);
  const [contactType, setContactType] = useState(null);
  const [processing, setProcessing] = useState(false);
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  //show selected users with check mark and to choose how to toggle them
  useEffect(() => {
    const listToUse = authContext.evacLists?.find(
      (list) => list.list_id === contact.list_id
    );
    const usersToCheck = listToUse.name.includes("alarm")
      ? authContext.selectedUsers
      : authContext.selectedUsersDrill;
    const contactIsSelected = usersToCheck.some(
      (item) =>
        // check if user from phone must be hidden from phone list. since id is unique only on a user device, check if the user itself added a contact from his phone.
        (item.phone_id &&
          contact.id &&
          item.phone_id == contact.id &&
          item.added_by == authContext.user.id) ||
        (item.phone_contact_id &&
          contact.phone_contact_id &&
          item.phone_contact_id == contact.phone_contact_id) ||
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
    authContext.selectedUsersDrill,
    authContext.companyUsers,
    authContext.localContacts,
    authContext.tempContacts,
    contact,
  ]);

  const addContactToSelected = async (contact) => {
    if (processing) return;
    setProcessing(true);

    try {
      const evacList = authContext.evacLists?.find(
        (list) => list.list_id === contact.list_id
      );
      const listToUse = evacList.name.includes("alarm")
        ? authContext.selectedUsers
        : authContext.selectedUsersDrill;
      const alreadyExist = listToUse.some(
        (item) =>
          (item.phone_id && contact.id && item.phone_id == contact.id) ||
          (item.contact_id &&
            contact.contact_id &&
            item.contact_id == contact.contact_id) ||
          (item.user_id &&
            contact.user_id &&
            item.user_id == contact.user_id) ||
          (item.user_to_list_id &&
            contact.user_to_list_id &&
            item.user_to_list_id == contact.user_to_list_id) ||
          (item.temp_id && contact.temp_id && item.temp_id == contact.temp_id)
      );

      if (!alreadyExist) {
        // Call API to add selected user
        const result = await createUserToListApi.createUserToList(contact);
        console.log("add selected API: ", JSON.stringify(result, null, 2));

        if (result.ok) {
          // The real-time hook will automatically update the lists
          // But we can update locally for immediate feedback
          if (result.data?.selected_users) {
            let evacList = authContext.evacLists?.find(
              (list) => list.list_id === contact.list_id
            );
            if (evacList.name.includes("alarm"))
              authContext.setSelectedUsers(result.data.selected_users);
            if (evacList.name.includes("drill"))
              authContext.setSelectedUsersDrill(result.data.selected_users);
          }
          if (result.data?.selected_users_checkins)
            authContext.setSelectedUsersCheckins(
              result.data.selected_users_checkins
            );

          // Notify the parent component to update the filtered contact list
          onContactToggle && onContactToggle(contact.id, true);
          Toast.show(t("toast selected user added"), {
            duration: Toast.durations.SHORT,
          });
          console.log("Contact added, real-time update will follow");
        } else {
          const errorMessage = result.data?.error_code
            ? t(result.data.error_code)
            : t("toast error general");
          Toast.show(errorMessage, { duration: Toast.durations.SHORT });
        }
      }
    } catch (error) {
      console.error("Add contact failed:", error);
      Toast.show(t("toast error general"), { duration: Toast.durations.SHORT });
    } finally {
      setProcessing(false);
    }
  };

  const removeContactFromSelected = async (contact) => {
    if (processing) return;

    if (authContext.evacuation?.real_event || authContext.evacuation?.drill) {
      Toast.show(t("toast cant remove selected"), {
        duration: Toast.durations.SHORT,
      });
      return;
    }

    setProcessing(true);

    try {
      // Call API to remove selected user
      const result = await deleteUserToListApi.deleteUserToList(contact);
      console.log("remove selected user: ", JSON.stringify(result, null, 2));

      if (result.ok) {
        // The real-time hook will automatically update the lists
        // But we can update locally for immediate feedback
        if (result.data?.selected_users) {
          let evacList = authContext.evacLists?.find(
            (list) => list.list_id === contact.list_id
          );
          console.log("remove contact evac list: ", evacList);
          if (evacList.name.includes("alarm"))
            authContext.setSelectedUsers(result.data.selected_users);
          if (evacList.name.includes("drill"))
            authContext.setSelectedUsersDrill(result.data.selected_users);
        }
        if (result.data?.selected_users_checkins)
          authContext.setSelectedUsersCheckins(
            result.data.selected_users_checkins
          );

        // Notify the parent component to update the filtered contact list
        onContactToggle && onContactToggle(contact.id, false);
        Toast.show(t("toast selected user removed"), {
          duration: Toast.durations.SHORT,
        });
        console.log("Contact removed, real-time update will follow");
      } else {
        const errorMessage = result.data?.error_code
          ? t(result.data.error_code)
          : t("toast error general");
        Toast.show(errorMessage, { duration: Toast.durations.SHORT });
      }
    } catch (error) {
      console.error("Remove contact failed:", error);
      Toast.show(t("toast error general"), { duration: Toast.durations.SHORT });
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelected = async () => {
    if (processing) return;

    if (!selected) {
      await addContactToSelected(contact);
    } else {
      await removeContactFromSelected(contact);
    }
  };

  // set contact type, based on FK key
  useEffect(() => {
    if (contact.user_id) {
      setContactType("company");
    } else if (contact.contact_id) {
      setContactType("local");
    } else if (contact.temp_id) {
      setContactType("temporary");
    } else if (contact.phone_id) {
      setContactType("phone");
    }
  }, [contact]);

  if (selected && filter !== "selected") {
    return;
  }
  if (
    (selected && filter == "selected") ||
    (!selected && filter !== "selected")
  ) {
    return (
      <TouchableOpacity
        style={[styles.contactCon, processing && styles.processingContact]}
        onPress={toggleSelected}
        disabled={processing}
      >
        <View style={styles.imgContainer}>
          <View style={styles.placeholder}>
            {contact?.image?.uri && (
              <Image
                style={styles.contactImg}
                source={{ uri: contact.image.uri }}
              />
            )}
            {(contact.phone_id || contact.id) && !contact?.image?.uri && (
              <Image
                style={styles.phoneImg}
                source={require("../assets/phone_user.png")}
              />
            )}
            {contact.temp_id && contact.expires_in?.expire_date && (
              <Image
                style={styles.tempImg}
                source={require("../assets/temp_user.png")}
              />
            )}
            {(contact.contact_id || contact.temp_id) &&
              !contact.expires_in?.expire_date && (
                <Image
                  style={styles.localImg}
                  source={require("../assets/user.jpg")}
                />
              )}
            {contact.user_id &&
              contact.plan?.name &&
              contact.plan.name.toLowerCase() !== "collaborator" && (
                <FontAwesome6 name="user-tie" size={28} color={colors.grey} />
              )}
            {contact.user_id &&
              contact.plan?.name &&
              contact.plan.name.toLowerCase() == "collaborator" && (
                <FontAwesome6 name="users-rays" size={28} color={colors.grey} />
              )}
          </View>
        </View>
        <View style={styles.contactData}>
          {contact.name && (
            <Text style={styles.name}>
              {contact.name}{" "}
              {processing && (
                <Text style={styles.processingText}>({t("updating...")})</Text>
              )}
              {contact.phoneNumbers?.length > 0 ? (
                <MaterialCommunityIcons name="phone" size={14} />
              ) : null}
            </Text>
          )}
          {!contact.name && (contact.firstname || contact.lastname) && (
            <Text style={styles.name}>
              {contact.firstname ? contact.firstname + " " : null}
              {contact.lastname ? contact.lastname : null}{" "}
              {processing && (
                <Text style={styles.processingText}>({t("updating...")})</Text>
              )}
              {contact.phoneNumbers?.length > 0 ? (
                <MaterialCommunityIcons name="phone" size={14} />
              ) : null}
            </Text>
          )}
          {!contact.name &&
            !contact.firstname &&
            !contact.lastname &&
            (contact.firstName || contact.lastName) && (
              <Text style={styles.name}>
                {contact.firstName ? contact.firstName + " " : null}
                {contact.lastName ? contact.lastName : null}{" "}
                {processing && (
                  <Text style={styles.processingText}>
                    ({t("updating...")})
                  </Text>
                )}
                {contact.phoneNumbers?.length > 0 ? (
                  <MaterialCommunityIcons name="phone" size={14} />
                ) : null}
              </Text>
            )}
          {!contact.name &&
            !contact.firstname &&
            !contact.lastname &&
            !contact.firstName &&
            !contact.lastName && (
              <Text style={styles.name}>
                {contact.name ? contact.name : t("no name")}{" "}
                {processing && (
                  <Text style={styles.processingText}>
                    ({t("updating...")})
                  </Text>
                )}
                {contact.phoneNumbers?.length > 0 ? (
                  <MaterialCommunityIcons name="phone" size={14} />
                ) : null}
              </Text>
            )}
        </View>
        {selected && !processing && (
          <View style={styles.selectedIcon}>
            <MaterialCommunityIcons
              name="check"
              size={28}
              color={colors.grey}
            />
          </View>
        )}
        {processing && (
          <View style={styles.selectedIcon}>
            <MaterialCommunityIcons
              name="loading"
              size={28}
              color={colors.primary}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }
};

const styles = StyleSheet.create({
  contactCon: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grey,
  },
  processingContact: {
    opacity: 0.7,
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
    width: 64,
    height: 64,
  },
  phoneImg: {
    width: 32,
    height: 32,
    opacity: 0.5,
  },
  tempImg: {
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
    flex: 0,
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
  processingText: {
    color: colors.primary,
    fontStyle: "italic",
    fontSize: 14,
  },
  selectedIcon: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 8,
  },
});

export default EvacContact;
