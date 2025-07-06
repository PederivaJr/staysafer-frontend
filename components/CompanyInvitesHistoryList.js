import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import cache from "../utility/cache";
import getInvitesHistoryApi from "../api/getInvitesHistory";
import InviteHistoryItem from "./InviteHistoryItem";
import { Picker } from "@react-native-picker/picker";
import RNPickerSelect from "react-native-picker-select";
import { COMPARE_DATE } from "../config/globals";
import Toast from "react-native-root-toast";

const CompanyInvitesHistoryList = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchContact, setSearchContact] = useState("");
  const [contactFilter, setContactFilter] = useState("all");
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    (async () => {
      let updatedInvites = [];
      const abortController = new AbortController();
      const result = await getInvitesHistoryApi.getInvitesHistory({
        signal: abortController.signal,
      });
      console.log("get history invites", JSON.stringify(result, null, 2));
      if (result.ok) {
        updatedInvites = result.data?.invites_history;
        //updatedInvites.sort(COMPARE_DATE);
        if (updatedInvites) {
          authContext.setInvitesHistory(updatedInvites);
          setInvites(updatedInvites);
        }
      }
      setLoading(false);

      return () => {
        abortController.abort();
      };
    })();
  }, []);

  const filteredInvitesByStatus =
    contactFilter !== "all" && contactFilter
      ? authContext.invitesHistory?.filter(
          (invite) => invite.status === contactFilter
        )
      : authContext.invitesHistory;

  const filteredContacts = searchContact
    ? filteredInvitesByStatus.filter(
        (invite) =>
          (invite?.received_by &&
            invite.received_by
              .toLowerCase()
              .includes(searchContact.toLowerCase())) ||
          (invite?.sended_by &&
            invite.sended_by
              .toLowerCase()
              .includes(searchContact.toLowerCase())) ||
          (invite?.status &&
            invite.status.toLowerCase().includes(searchContact.toLowerCase()))
      )
    : filteredInvitesByStatus;

  const keyExtractor = (item, idx) => {
    return item?.id || idx.toString();
  };
  const renderItem = ({ item }) => {
    return <InviteHistoryItem invite={item} />;
  };

  useIsFocused();

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
      {authContext.invitesHistory?.length > 0 && !loading && (
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerIcon}>
            <MaterialCommunityIcons size={24} name="filter-outline" />
          </View>
          <View style={styles.picker}>
            <RNPickerSelect
              style={{
                ...pickerSelectStyles,
                iconContainer: {
                  top: 19,
                  right: 9,
                },
              }}
              Icon={() => {
                if (Platform.OS === "ios") {
                  return (
                    <FontAwesome6
                      name="caret-down"
                      size={14}
                      color={colors.darkGrey}
                    />
                  );
                } else null;
              }}
              placeholder={{}}
              value={contactFilter}
              onValueChange={(itemValue) => setContactFilter(itemValue)}
              items={[
                { label: t("invites all"), value: "all" },
                { label: t("accepted"), value: "accepted" },
                { label: t("rejected"), value: "rejected" },
              ]}
            />
          </View>
        </View>
      )}
      {authContext.invitesHistory?.length > 0 && !loading && (
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            size={24}
            style={styles.icon}
            name="magnify"
          />
          <TextInput
            placeholder={t("input placeholder search")}
            value={searchContact}
            onChangeText={(text) => {
              setSearchContact(text);
            }}
            style={styles.searchInput}
          />
        </View>
      )}
      {authContext.invitesHistory?.length > 0 &&
        filteredContacts &&
        !loading && (
          <FlatList
            data={filteredContacts}
            extraData={filteredContacts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
          />
        )}
      {authContext.invitesHistory?.length == 0 && !loading && (
        <View style={styles.noInvitesWrapper}>
          <View style={styles.noInvitesIcon}>
            <MaterialCommunityIcons
              name="mailbox-open"
              size={96}
              color={colors.grey}
            />
            <MaterialCommunityIcons
              name="history"
              size={96}
              color={colors.grey}
            />
          </View>
          <Text style={styles.noInvitesText}>{t("no invites history")}</Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  pickerWrapper: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: colors.grey,
    borderBottomWidth: 1,
    borderTopColor: colors.grey,
    borderTopWidth: 1,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  picker: {
    flexGrow: 1,
  },
  pickerIcon: {
    paddingLeft: 16,
  },
  searchContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.lighterGrey,
    borderRadius: 32,
    borderColor: colors.grey,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    borderColor: colors.grey,
    borderWidth: 0,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
    marginRight: 8,
    marginVertical: 8,
  },
  searchIcon: {},
  evacLeft: {
    borderRadius: 16,
    backgroundColor: colors.lightGrey,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  checkboxContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  checkboxText: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  checkbox: {
    flex: 0,
    marginLeft: 8,
  },
  noInvitesMessage: {
    flex: 1,
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  noInvitesWrapper: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  noInvitesIcon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  noInvitesText: {
    fontSize: 18,
    color: colors.darkGrey,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12, // Increase vertical padding
    paddingHorizontal: 8,
    borderWidth: 0,
    borderColor: "gray",
    borderRadius: 0,
    color: "black",
    height: 50, // Ensure enough height for text
    lineHeight: 20, // Improve vertical alignment
    textAlignVertical: "center", // Ensures text stays centered
    paddingRight: 30, // Avoid overlap with icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12, // Increase vertical padding
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 0,
    color: "black",
    height: 50, // Match iOS height
    lineHeight: 20, // Improve vertical alignment
    textAlignVertical: "center",
    paddingRight: 30,
  },
});

export default CompanyInvitesHistoryList;
