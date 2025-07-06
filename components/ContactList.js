import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import EvacContact from "./EvacContact";
import { useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import cache from "../utility/cache";
import * as Contacts from "expo-contacts";
import TempContact from "./TempContact";
import LocalContact from "./LocalContact";
import { COMPARE_NAMES } from "../config/globals";
import RNPickerSelect from "react-native-picker-select";
import { FontAwesome6 } from "@expo/vector-icons";
import useEvacListUsers from "../hooks/useEvacListUsers";

const ContactList = ({ list, permissions }) => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchContact, setSearchContact] = useState("");
  const [contactFilter, setContactFilter] = useState("selected");
  const [filteredContactsArray, setFilteredContactsArray] = useState([]);

  //console.log("list is: ", JSON.stringify(list, null, 2));
  // ✅ NEW: Real-time hooks that replace useInitData functionality
  useEvacListUsers(); // Updates evac lists, temp contacts, selected users in real-time

  useEffect(() => {
    cache.get("contactFilter").then((value) => {
      if (value !== null) {
        setContactFilter(value);
      }
    });
  }, []);

  useEffect(() => {
    cache.store("contactFilter", contactFilter);
  }, [contactFilter]);

  const pickerItems = useMemo(
    () => [
      { label: t("evac list"), value: "selected" },
      { label: t("company users"), value: "company" },
      { label: t("phone contacts"), value: "phone" },
      { label: t("temporary users"), value: "temporary" },
    ],
    [t]
  );

  const filteredContacts = useMemo(() => {
    let contacts = [];
    switch (contactFilter) {
      case "phone":
        contacts = phoneContacts;
        break;
      case "local":
        contacts = authContext.localContacts || [];
        break;
      case "company":
        contacts = authContext.companyUsers || [];
        break;
      case "selected":
        contacts = list?.name.includes("alarm")
          ? authContext.selectedUsers
          : authContext.selectedUsersDrill;
        break;
      case "temporary":
        contacts = authContext.tempContacts || [];
        break;
      default:
        contacts = phoneContacts;
    }

    return contacts
      .filter((contact) =>
        searchContact
          ? (contact.name || "")
              .toLowerCase()
              .includes(searchContact.toLowerCase())
          : true
      )
      .sort(COMPARE_NAMES);
  }, [
    phoneContacts,
    contactFilter,
    authContext.selectedUsers,
    authContext.selectedUsersDrill,
    list?.name,
    searchContact,
  ]);

  useEffect(() => {
    setFilteredContactsArray(filteredContacts);
  }, [filteredContacts]);

  const fetchPhoneContacts = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data?.length > 0) {
        const revisedContacts = data.map((contact) => {
          const uniquePhoneNumbers = contact.phoneNumbers
            ? Array.from(
                new Map(
                  contact.phoneNumbers.map((item) => [item.number, item])
                ).values()
              )
            : [];

          return {
            id: contact.id,
            firstname: contact.firstName || contact.name || "",
            lastname: contact.lastName || null,
            name: contact.name?.trim() || "",
            phoneNumbers: uniquePhoneNumbers.map((item) => ({
              number: item.number,
            })),
            list_id: list?.list_id,
          };
        });

        setPhoneContacts(revisedContacts.sort(COMPARE_NAMES));
      }
    } catch (error) {
      console.error("Error fetching phone contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions) fetchPhoneContacts();
    else setLoading(false);
  }, [permissions]);

  const renderItem = ({ item }) => {
    if (!list) return;
    if (item) item.list_id = list?.list_id;
    if (item.contact_id) {
      return <LocalContact contact={item} filter={contactFilter} />;
    }
    if (item.temp_id && !item.instance_number) {
      return <TempContact contact={item} filter={contactFilter} />;
    }
    return <EvacContact contact={item} filter={contactFilter} />;
  };

  useIsFocused();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.brightGreen} />
      ) : (
        <FlatList
          data={filteredContactsArray}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.pickerWrapper}>
                <RNPickerSelect
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 19,
                      right: 19,
                    },
                  }}
                  Icon={() => (
                    <FontAwesome6
                      name="caret-down"
                      size={20}
                      color={colors.darkGrey}
                    />
                  )}
                  placeholder={{}}
                  value={contactFilter}
                  onValueChange={setContactFilter}
                  items={pickerItems.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                />
              </View>
              <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={24} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t("input placeholder search")}
                  value={searchContact}
                  onChangeText={setSearchContact}
                />
              </View>
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  pickerContainer: {
    flex: 0,
    paddingLeft: 4,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 8,
  },
  picker: {
    width: "100%",
  },
  pickerIos: {
    position: "absolute",
    top: -60,
    width: "100%",
    padding: 0,
  },
  pickerItem: {
    lineHeight: 20,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 8,
    padding: 5,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
  },
  pickerWrapper: {
    marginVertical: 8,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 8,
  },
  picker: {
    backgroundColor: colors.lighterGrey,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "black",
    height: 60,
    width: "100%",
    borderColor: colors.grey,
    borderWidth: 0,
    borderRadius: 8,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "black",
    height: 60,
    width: "100%",
    borderColor: colors.grey,
    borderWidth: 0,
    borderRadius: 8,
  },
});

export default ContactList;
