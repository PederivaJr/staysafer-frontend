import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import ModalLocalContact from "../components/ModalLocalContact";
import ModalTempContact from "../components/ModalTempContact";
import { AuthContext } from "../context/AuthContext";
import OptionMenuEvacList from "../components/OptionMenuEvacList";
import ContactList from "../components/ContactList";
import ProminentDisclosureContacts from "../components/ProminentDisclosureContacts";
import * as Contacts from "expo-contacts";
import clearListFromUsersApi from "../api/clearListFromUsers";
import Toast from "react-native-root-toast";
import getEvacListUsersApi from "../api/getEvacListUsers";
import useEvacListUsers from "../hooks/useEvacListUsers";
import { useIsFocused } from "@react-navigation/native";

function SelectedUsersScreen({ route }) {
  const [isModalVisibleLocal, setModalVisibleLocal] = useState(false);
  const [isModalVisibleTemp, setModalVisibleTemp] = useState(false);
  const [hasContactPermissions, setHasContactPermissions] = useState(null);
  const [disclosureModalVisible, setDisclosureModalVisible] = useState(false);
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  let list = null;
  if (route.params?.list) list = route.params?.list;
  if (!list)
    list = authContext.evacLists.find((list) => list.type.includes("alarm"));

  // Use the real-time evac list users hook
  const {
    selectedUsers: realtimeSelectedUsers = [],
    selectedUsersDrill: realtimeSelectedUsersDrill = [],
    tempContacts: realtimeTempContacts = [],
    companyUsers: realtimeCompanyUsers = [],
    loading: usersLoading = false,
    error: usersError = null,
    lastUpdate = null,
  } = useEvacListUsers(list?.list_id) || {};

  // Always load initial data from MySQL API when screen is focused
  useEffect(() => {
    if (isFocused && list?.list_id) {
      console.log(
        "SelectedUsersScreen focused, loading evac list users from MySQL API (source of truth)"
      );
      refreshEvacListUsers();
    }
  }, [isFocused, list?.list_id]);

  // Apply real-time updates to the MySQL data
  useEffect(() => {
    if (lastUpdate && authContext.selectedUsers?.length >= 0) {
      if (lastUpdate.action === "contact_added") {
        console.log("Applying real-time contact addition to existing lists");
        // For additions, refresh the complete list to get the new contact
        refreshEvacListUsers();
      } else if (lastUpdate.action === "contact_removed") {
        console.log("Applying real-time contact removal to existing lists");
        // For removals, refresh the complete list to reflect the removal
        refreshEvacListUsers();
      }
    }
  }, [lastUpdate]);

  // Update context with real-time data when available
  useEffect(() => {
    if (realtimeSelectedUsers && realtimeSelectedUsers.length >= 0) {
      console.log(
        "SelectedUsersScreen: Updating selected users from real-time data"
      );
      authContext.setSelectedUsers(realtimeSelectedUsers);
    }
  }, [realtimeSelectedUsers]);

  useEffect(() => {
    if (realtimeSelectedUsersDrill && realtimeSelectedUsersDrill.length >= 0) {
      console.log(
        "SelectedUsersScreen: Updating drill users from real-time data"
      );
      authContext.setSelectedUsersDrill(realtimeSelectedUsersDrill);
    }
  }, [realtimeSelectedUsersDrill]);

  useEffect(() => {
    if (realtimeTempContacts && realtimeTempContacts.length >= 0) {
      console.log(
        "SelectedUsersScreen: Updating temp contacts from real-time data"
      );
      authContext.setTempContacts(realtimeTempContacts);
    }
  }, [realtimeTempContacts]);

  useEffect(() => {
    if (realtimeCompanyUsers && realtimeCompanyUsers.length >= 0) {
      console.log(
        "SelectedUsersScreen: Updating company users from real-time data"
      );
      authContext.setCompanyUsers(realtimeCompanyUsers);
    }
  }, [realtimeCompanyUsers]);

  // Log real-time updates for debugging
  useEffect(() => {
    if (lastUpdate) {
      console.log("SelectedUsersScreen: Update received:", {
        action: lastUpdate.action,
        listId: lastUpdate.listId,
        contactType: lastUpdate.contactType,
        addedContactName: lastUpdate.addedContactName,
        removedContactName: lastUpdate.removedContactName,
        updatedBy: lastUpdate.updatedBy,
      });
    }
  }, [lastUpdate]);

  // Manual refresh function (as backup and for initial load)
  const refreshEvacListUsers = async () => {
    if (!list?.list_id) return;

    try {
      const result = await getEvacListUsersApi.getEvacListUsers(list.list_id);
      console.log(
        "Manual refresh evac list users:",
        JSON.stringify(result, null, 2)
      );

      if (result.ok) {
        if (result.data?.selected_users)
          authContext.setSelectedUsers(result.data.selected_users);
        if (result.data?.selected_users_drill)
          authContext.setSelectedUsersDrill(result.data.selected_users_drill);
        if (result.data?.temp_contacts)
          authContext.setTempContacts(result.data.temp_contacts);
        if (result.data?.company_users)
          authContext.setCompanyUsers(result.data.company_users);
      }
    } catch (error) {
      console.error("Manual refresh evac list users failed:", error);
    }
  };

  const clearList = async () => {
    const abortController = new AbortController();
    const result = await clearListFromUsersApi.clearListFromUsers(
      list.list_id,
      { signal: abortController.signal }
    );

    if (result.ok && result.data) {
      Toast.show(t("list cleared"), {
        duration: Toast.durations.LONG,
      });
      // Update local state immediately for clear action
      authContext.setSelectedUsers(result.data.selected_users);
    }
  };

  const handleAgree = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      setHasContactPermissions(true);
    } else {
      setHasContactPermissions(false);
    }
    setDisclosureModalVisible(false);
  };

  const handleSkip = () => {
    setDisclosureModalVisible(false);
  };

  // get contact permissions
  useEffect(() => {
    const checkContactPermissions = async () => {
      let { granted, canAskAgain } = await Contacts.getPermissionsAsync();
      if (!granted && canAskAgain) {
        setDisclosureModalVisible(true);
      }
      if (!granted && !canAskAgain) {
        setHasContactPermissions(false);
      }
      if (granted) {
        setHasContactPermissions(true);
      }
    };

    checkContactPermissions();
  }, []);

  const handleAction = (action) => {
    if (action === "local") setModalVisibleLocal(true);
    if (action === "temp") setModalVisibleTemp(true);
    if (action === "clear") clearList(list.list_id);
  };

  // Show error message if there's a critical Firestore error
  if (usersError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{usersError}</Text>
          <Text style={styles.retryText} onPress={refreshEvacListUsers}>
            {t("tap to retry")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!hasContactPermissions && (
        <ProminentDisclosureContacts
          visible={disclosureModalVisible}
          onAgree={handleAgree}
          onSkip={handleSkip}
          onClose={handleSkip}
        />
      )}
      <View style={styles.addContactContainer}>
        <View style={styles.evacLeft}>
          <Text style={styles.infinity}>
            {t("selected")}
            {": "}
            {authContext.selectedUsers?.length
              ? authContext.selectedUsers.length
              : 0}
            {usersLoading &&
              authContext.selectedUsers?.length === 0 &&
              " (loading...)"}
          </Text>
        </View>
        <OptionMenuEvacList onSelectAction={handleAction} />
      </View>
      <ContactList list={list} permissions={hasContactPermissions} />
      <ModalLocalContact
        isVisible={isModalVisibleLocal}
        onClose={() => setModalVisibleLocal(false)}
        authContext={authContext}
      />
      <ModalTempContact
        isVisible={isModalVisibleTemp}
        list={list}
        onClose={() => setModalVisibleTemp(false)}
        authContext={authContext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lighterGrey,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  retryText: {
    color: colors.primary,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  textInput: {
    height: 48,
    borderColor: colors.grey,
    borderBottomWidth: 1,
    paddingRight: 30,
    color: colors.darkGrey,
  },
  errorText: {
    color: "red",
    fontSize: 10,
  },
  btnContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  checkboxContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkboxText: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  checkbox: {
    flex: 0,
    marginRight: 8,
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
    width: "100%",
    padding: 0,
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
  modalList: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  modalFooter: {
    flex: 0,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  inputTextWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
    width: "100%",
  },
  addContactContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    marginHorizontal: 0,
  },
  addContact: {},
  infinity: {
    fontSize: 18,
  },
  evacLeft: {
    borderRadius: 16,
    backgroundColor: colors.lighterGrey,
    marginRight: 0,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  fullWidth: {
    width: "80%",
  },
});

export default SelectedUsersScreen;
