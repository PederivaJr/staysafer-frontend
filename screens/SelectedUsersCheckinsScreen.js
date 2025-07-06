import React, { useEffect, useState, useContext, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Linking,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import ListItem from "../components/ListItem";
import SwipeContactAction from "../components/SwipeContactAction";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";
import { useIsFocused } from "@react-navigation/native";
import SavedPeopleCounter from "../components/SavedPeopleCounter";
import AbsentPeopleCounter from "../components/AbsentPeopleCounter";
import Toast from "react-native-root-toast";
import NoAlarmMessage from "../components/NoAlarmMessage";
import colors from "../config/color";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import listCheckinApi from "../api/listCheckin";
import createCheckinApi from "../api/createCheckin";
import RNPickerSelect from "react-native-picker-select";
import NoPlanMessage from "../components/NoPlanMessage";
import { COMPARE_NAMES } from "../config/globals";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import Screen from "../components/Screen";
import useCheckinsRealtime from "../hooks/useCheckins";

function SelectedUsersCheckinsScreen(props) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [contactFilter, setContactFilter] = useState("all");
  const [filteredContactsArray, setFilteredContactsArray] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactPhoneNumbers, setContactPhoneNumbers] = useState([]);
  const prevRef = useRef(null);
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  // Use the real-time checkins hook for checkin updates only
  const {
    checkinsData,
    loading: checkinsLoading,
    error: checkinsError,
    mergeCheckinsWithUsers,
  } = useCheckinsRealtime();

  const abortControllerRef = useRef(new AbortController());

  // Initial load of users and checkins data
  const refreshCheckins = async () => {
    if (!authContext.evacuation?.list_id) {
      console.log("No evacuation or list_id found, skipping refresh");
      return;
    }

    console.log(
      "Refreshing checkins for list_id:",
      authContext.evacuation.list_id
    );
    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const result = await listCheckinApi.listSelectedContactsCheckins(
        authContext.evacuation.list_id,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      console.log(
        "Loading initial check-ins data:",
        JSON.stringify(result, null, 2)
      );

      if (result.ok && result.data?.selected_users_checkins) {
        authContext.setSelectedUsersCheckins(
          result.data.selected_users_checkins
        );
      } else {
        console.error("Failed to load checkins:", result);
        if (result.status === 404) {
          // If 404, it means no checkins exist yet for this evacuation, which is normal
          console.log(
            "No existing checkins found - this is normal for a new evacuation"
          );
          authContext.setSelectedUsersCheckins([]);
        }
      }
    } catch (error) {
      console.error("Failed to load initial checkins:", error);
      Toast.show(t("toast error general"), { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when screen is focused
  useEffect(() => {
    if (isFocused && authContext.evacuation?.list_id) {
      console.log("Screen focused with evacuation:", authContext.evacuation);
      // Don't automatically load checkins - let real-time hook handle it
      // Only load manually when user requests refresh
    }
  }, [isFocused, authContext.evacuation?.evacuation_id]); // Use evacuation_id instead of list_id

  // Merge real-time checkins data with existing users data
  useEffect(() => {
    if (checkinsData && authContext.selectedUsersCheckins) {
      console.log("Merging real-time checkins with existing users");
      const mergedData = mergeCheckinsWithUsers(
        authContext.selectedUsersCheckins,
        checkinsData
      );

      // Only update if there are actual changes
      if (
        JSON.stringify(mergedData) !==
        JSON.stringify(authContext.selectedUsersCheckins)
      ) {
        authContext.setSelectedUsersCheckins(mergedData);
      }
    }
  }, [checkinsData]);

  useEffect(() => {
    const filterContacts = () => {
      if (
        !authContext.selectedUsersCheckins ||
        authContext.selectedUsersCheckins.length === 0
      ) {
        setFilteredContactsArray([]);
        return;
      }

      let updatedContactsArray = [];

      switch (contactFilter) {
        case "saved":
          updatedContactsArray = authContext.selectedUsersCheckins.filter(
            (contact) => {
              if (!contact?.checkins) return false;
              const activeCheckins = Object.values(contact.checkins).filter(
                (checkin) => checkin.active
              );
              console.log("active checkins: ", activeCheckins);
              return (
                (authContext.settings.confirmed_save &&
                  contact.user_id &&
                  activeCheckins?.length >= 2 &&
                  !contact?.checkins?.absent?.active) ||
                (authContext.settings.confirmed_save &&
                  !contact.user_id &&
                  activeCheckins?.length >= 1 &&
                  !contact?.checkins?.absent?.active) ||
                (!authContext.settings.confirmed_save &&
                  activeCheckins?.length >= 1 &&
                  !contact?.checkins?.absent?.active)
              );
            }
          );
          break;
        case "absent":
          updatedContactsArray = authContext.selectedUsersCheckins.filter(
            (contact) => contact?.checkins?.absent?.active
          );
          break;
        case "missing":
          updatedContactsArray = authContext.selectedUsersCheckins.filter(
            (contact) => {
              if (!contact?.checkins) return false;
              const activeCheckins = Object.values(contact.checkins).filter(
                (checkin) => checkin.active
              );
              return authContext.settings?.confirmed_save && contact.user_id
                ? !contact.checkins?.absent?.active &&
                    activeCheckins?.length < 2
                : !contact.checkins?.absent?.active &&
                    activeCheckins?.length === 0;
            }
          );
          break;
        case "all":
        default:
          updatedContactsArray = [...authContext.selectedUsersCheckins];
          break;
      }

      updatedContactsArray.sort(COMPARE_NAMES);
      setFilteredContactsArray(updatedContactsArray || []);
    };

    filterContacts();
  }, [contactFilter, authContext.selectedUsersCheckins, authContext.settings]);

  const dialContact = (item) => {
    if (!item?.phoneNumbers?.length) {
      Toast.show(t("toast no number"), { duration: Toast.durations.LONG });
      return;
    }

    if (item.phoneNumbers?.length === 1) {
      Linking.openURL(`tel:${item.phoneNumbers[0].number}`);
    } else if (item.phoneNumbers?.length > 1) {
      setContactPhoneNumbers([...item.phoneNumbers]);
      toggleModal();
    }

    prevRef.current?.close();
  };

  const setNumberToCall = (numberToCall) => {
    toggleModal();
    Linking.openURL(`tel:${numberToCall}`);
  };

  const toggleAbsentContact = async (contact) => {
    const isSetSafe = authContext.selectedUsersCheckins?.some(
      (item) =>
        item.user_to_list_id === contact.user_to_list_id &&
        Object.entries(item.checkins).some(
          ([key, checkin]) => key !== "absent" && checkin.active
        )
    );

    if (isSetSafe) {
      Toast.show(t("toast cant absent safe"), {
        duration: Toast.durations.LONG,
      });
      return;
    }

    prevRef.current?.close();

    abortControllerRef.current = new AbortController();

    const updatedContact = {
      ...contact,
      checkin_type: "absent",
      checkin_date: new Date(),
      evac_point_id: null,
      checkin_status: !contact.checkins?.absent?.active,
      list_id: authContext.evacuation.list_id,
    };

    try {
      const result = await createCheckinApi.createCheckin(updatedContact, {
        signal: abortControllerRef.current.signal,
      });

      if (result.ok) {
        // The real-time hook will automatically update the checkins data
        // No need to manually update state here
        console.log("Checkin created, real-time update will follow");
      } else {
        Toast.show(t("toast error general"), {
          duration: Toast.durations.SHORT,
        });
      }
    } catch (error) {
      console.error("Toggle absent contact failed:", error);
      Toast.show(t("toast error general"), { duration: Toast.durations.SHORT });
    }
  };

  const renderPhoneNumbers = ({ item }) => (
    <TouchableOpacity onPress={() => setNumberToCall(item.number)}>
      <View style={styles.phoneNumberItem}>
        <Text style={styles.phoneNumberItemText}>{item.number}</Text>
      </View>
    </TouchableOpacity>
  );

  const toggleModal = () => setModalVisible(!modalVisible);

  const renderItem = ({ item }) => {
    const isAbsent = item?.checkins?.absent?.active;
    return (
      <ListItem
        contact={item}
        ref={prevRef}
        renderRightActions={() => (
          <SwipeContactAction
            name={!isAbsent ? "account-cancel-outline" : "account-outline"}
            onPress={() => toggleAbsentContact(item)}
            background={!isAbsent ? "#fff0f0" : "#f0fff0"}
          />
        )}
        renderLeftActions={() => (
          <SwipeContactAction
            name="phone"
            onPress={() => dialContact(item)}
            background="#f0faff"
          />
        )}
      />
    );
  };

  // Show error message if there's a critical Firestore error
  if (checkinsError) {
    console.warn("Firestore checkins error:", checkinsError);
    // Don't block the UI, just log the error and continue with existing functionality
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Header />
        {!authContext?.plan?.active && <NoPlanMessage />}
        {authContext.plan.active && !authContext.evacuation?.evacuation_id && (
          <NoAlarmMessage />
        )}
        {authContext.plan.active && authContext.evacuation?.evacuation_id && (
          <View style={styles.listContainer}>
            <View style={styles.stats}>
              <SavedPeopleCounter />
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshCheckins}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="reload"
                  color={loading ? colors.grey : colors.primary}
                  size={30}
                />
              </TouchableOpacity>
              <AbsentPeopleCounter />
            </View>
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
                    { label: t("all people"), value: "all" },
                    { label: t("safe people"), value: "saved" },
                    { label: t("missing people"), value: "missing" },
                    { label: t("absent people"), value: "absent" },
                  ]}
                />
              </View>
            </View>
            {filteredContactsArray?.length === 0 && !loading && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  {t("label empty selected")}
                </Text>
              </View>
            )}
            <FlatList
              data={filteredContactsArray}
              renderItem={renderItem}
              keyExtractor={(item) => item.user_to_list_id.toString()}
              refreshing={loading}
              onRefresh={refreshCheckins}
            />
            <Modal
              isVisible={modalVisible}
              onBackdropPress={toggleModal}
              onBackButtonPress={toggleModal}
              style={styles.modal}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={contactPhoneNumbers}
                  renderItem={renderPhoneNumbers}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </Modal>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  shareIcon: {
    marginRight: 4,
    color: colors.grey,
  },
  stats: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  refreshButton: {
    padding: 8,
  },
  tabs: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    backgroundColor: colors.green,
    paddingVertical: 4,
  },
  noResultsContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  noResultsText: {
    fontSize: 20,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  modalContent: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.lighterGrey,
    width: "80%",
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  modalHeaderTitle: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 8,
  },
  modalHeaderClose: {
    borderColor: colors.grey,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  closeButton: {},
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    marginBottom: 16,
    width: "100%",
  },
  modalList: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
  },
  modalFooter: {
    flex: 0,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  phoneNumberItemText: {
    fontSize: 16,
  },
  phoneNumberItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: colors.white,
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
  },
  picker: {
    flexGrow: 1,
  },
  pickerIcon: {
    paddingLeft: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 8,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "black",
    height: 60,
    width: "100%",
  },
});

export default SelectedUsersCheckinsScreen;
