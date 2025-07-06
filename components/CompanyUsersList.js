import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import getCompanyUsersApi from "../api/getCompanyUsers";
import CompanyContact from "./CompanyContact";
import { COMPARE_NAMES } from "../config/globals";
import useCompanyUsers from "../hooks/useCompanyUsers";

const CompanyUsersList = () => {
  const [searchContact, setSearchContact] = useState("");
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const isFocused = useIsFocused();

  // Use the real-time company users hook for role updates
  const {
    companyUsers: realtimeUsers = [], // Real-time data for role updates
    evacPoints = [],
    loading: usersLoading = false,
    error: usersError = null,
    lastUpdate = null,
  } = useCompanyUsers() || {};

  // Always load initial data from MySQL API when screen is focused
  useEffect(() => {
    if (isFocused && authContext.user?.company_id) {
      console.log(
        "Screen focused, loading company users from MySQL API (source of truth)"
      );
      refreshCompanyUsers();
    }
  }, [isFocused, authContext.user?.company_id]);

  // Apply real-time role updates to the MySQL data
  useEffect(() => {
    if (lastUpdate && authContext.companyUsers?.length > 0) {
      if (lastUpdate.action === "role_update") {
        console.log("Applying real-time role update to existing users list");

        const updatedUsers = authContext.companyUsers.map((user) => {
          if (user.user_id === lastUpdate.changedUserId) {
            console.log(
              `Updating role for ${user.name}: ${user.role} -> ${lastUpdate.newRole}`
            );
            return {
              ...user,
              role: lastUpdate.newRole,
            };
          }
          return user;
        });

        authContext.setCompanyUsers(updatedUsers);
        console.log("Role update applied successfully");

        // IMPORTANT: Show notification if current user's role was changed
        if (lastUpdate.changedUserId === authContext.user?.id) {
          console.log(
            "Current user's role was updated, triggering screen refresh"
          );

          // Small delay to ensure context updates are processed
          setTimeout(() => {
            // The useCompanyUsers hook already updated authContext.user.role
            // This timeout ensures all context updates are processed before any screen transitions
            console.log("Current user role update processed:", {
              user_id: authContext.user?.id,
              new_role: lastUpdate.newRole,
              updated_by: lastUpdate.updatedBy,
            });
          }, 100);
        }
      } else if (lastUpdate.action === "user_joined") {
        console.log("New user joined company, refreshing user list");
        // Refresh the complete list from API to get the new user
        refreshCompanyUsers();
      } else if (lastUpdate.action === "user_removed") {
        console.log("User removed from company, refreshing user list");
        // Refresh the complete list from API to reflect the removal
        refreshCompanyUsers();
      }
    }
  }, [lastUpdate]);

  // Update evac points when real-time data changes
  useEffect(() => {
    if (evacPoints && evacPoints.length >= 0) {
      console.log("CompanyUsersList: Updating evac points from real-time data");
      authContext.setMarkers(evacPoints);
    }
  }, [evacPoints]);

  // Enhanced logging for current user role changes
  useEffect(() => {
    if (lastUpdate && lastUpdate.changedUserId === authContext.user?.id) {
      console.log("CompanyUsersList: Current user role update detected:", {
        action: lastUpdate.action,
        changedUserName: lastUpdate.changedUserName,
        oldRole: lastUpdate.oldRole,
        newRole: lastUpdate.newRole,
        updatedBy: lastUpdate.updatedBy,
        currentUserRole: authContext.user?.role,
      });
    }
  }, [lastUpdate, authContext.user?.role]);

  // Manual refresh function (as backup)
  const refreshCompanyUsers = async () => {
    if (!authContext.user?.company_id) return;

    try {
      const abortController = new AbortController();
      const result = await getCompanyUsersApi.getCompanyUsers(
        authContext.user.company_id,
        { signal: abortController.signal }
      );

      console.log(
        "Manual refresh company users:",
        JSON.stringify(result.data, null, 2)
      );

      if (result.ok) {
        const companyUsersList = result.data.company_users;
        companyUsersList.sort(COMPARE_NAMES);
        authContext.setCompanyUsers(companyUsersList);
      }
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  const keyExtractor = (item, idx) => {
    return item?.id || idx.toString();
  };

  const renderItem = ({ item }) => {
    return <CompanyContact contact={item} />;
  };

  const filteredContacts = searchContact
    ? authContext.companyUsers.filter(
        (contact) =>
          (contact.name &&
            contact.name.toLowerCase().includes(searchContact.toLowerCase())) ||
          (contact.firstname &&
            contact.firstname
              .toLowerCase()
              .includes(searchContact.toLowerCase())) ||
          (contact.lastname &&
            contact.lastname
              .toLowerCase()
              .includes(searchContact.toLowerCase()))
      )
    : authContext.companyUsers;

  // Show error message if there's a critical Firestore error
  if (usersError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={colors.danger}
          />
          <Text style={styles.errorText}>{usersError}</Text>
          <Text style={styles.retryText} onPress={refreshCompanyUsers}>
            {t("tap to retry")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {usersLoading && authContext.companyUsers?.length === 0 && (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator
            animating={usersLoading}
            size="large"
            color={colors.brightGreen}
          />
          <Text style={styles.loadingText}>{t("loading users...")}</Text>
        </View>
      )}

      {authContext.companyUsers?.length > 0 && !usersLoading && (
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

      {authContext.companyUsers?.length > 0 && (
        <FlatList
          data={filteredContacts}
          extraData={filteredContacts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.list}
          refreshing={usersLoading}
          onRefresh={refreshCompanyUsers}
        />
      )}

      {authContext.companyUsers?.length === 0 && !usersLoading && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="account-group"
            size={72}
            color={colors.lightGrey}
          />
          <Text style={styles.emptyText}>{t("no company users found")}</Text>
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
    marginTop: 8,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.grey,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: colors.grey,
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
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
});

export default CompanyUsersList;
