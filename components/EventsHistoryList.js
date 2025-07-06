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
import getEventsHistoryApi from "../api/getEventsHistory";
import EventHistoryItem from "./EventHistoryItem";
import RNPickerSelect from "react-native-picker-select";
import { COMPARE_DATE_EVENTS } from "../config/globals";

const EventsHistoryList = () => {
  const [loading, setLoading] = useState(true);
  const [searchContact, setSearchContact] = useState("");
  const [contactFilter, setContactFilter] = useState("all");
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  //get events from API
  useEffect(() => {
    const getEvents = async () => {
      setLoading(true);
      let updatedEvents = [];
      const abortController = new AbortController();
      const result = await getEventsHistoryApi.getEventsHistory({
        signal: abortController.signal,
      });
      if (result.ok) {
        updatedEvents = result.data.events_history;
        //updatedEvents.sort(COMPARE_DATE_EVENTS);
        authContext.setEventsHistory(updatedEvents);
      }
      setLoading(false);

      return () => {
        abortController.abort();
      };
    };
    getEvents();
  }, []);

  const filteredEventsByType =
    contactFilter !== "all" && contactFilter
      ? authContext.eventsHistory.filter(
          (event) => event.type === contactFilter
        )
      : authContext.eventsHistory;

  const filteredEvents = searchContact
    ? filteredEventsByType.filter(
        (event) =>
          (event?.type &&
            event.type.toLowerCase().includes(searchContact.toLowerCase())) ||
          (event?.date && event.date.includes(searchContact)) ||
          (event?.id && event.id.toString().includes(searchContact))
      )
    : filteredEventsByType;

  const keyExtractor = (item, idx) => {
    return item?.id || idx.toString();
  };

  const renderItem = ({ item }) => {
    return <EventHistoryItem event={item} />;
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
      {!loading && authContext.eventsHistory?.length > 0 && (
        <View style={styles.contentContainer}>
          {authContext.eventsHistory?.length > 0 && (
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
                    { label: t("drill"), value: "drill" },
                    { label: t("alarm"), value: "alarm" },
                  ]}
                />
              </View>
            </View>
          )}
          {authContext.eventsHistory?.length > 0 && (
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
          {authContext.eventsHistory?.length > 0 &&
            filteredEvents?.length > 0 && (
              <FlatList
                data={filteredEvents}
                extraData={filteredEvents}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                style={styles.list}
              />
            )}
        </View>
      )}
      {!loading && authContext.eventsHistory?.length === 0 && (
        <View style={styles.noInvitesMessage}>
          <MaterialCommunityIcons
            name="chart-bar"
            size={96}
            color={colors.grey}
          />
          <Text style={styles.noInvitesText}>{t("no events")}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
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
  pickerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: colors.grey,
    borderBottomWidth: 1,
    borderTopColor: colors.grey,
    borderTopWidth: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  picker: {
    flexGrow: 1,
  },
  pickerIcon: {
    paddingLeft: 16,
  },
  searchContainer: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  checkboxText: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  checkbox: {
    marginLeft: 8,
  },
  noInvitesWrapper: {
    flex: 1,
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
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default EventsHistoryList;
