import React, { useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import colors from "../config/color";
import PendingInviteItem from "./PendingInviteItem";
import usePendingInvites from "../hooks/usePendingInvites";

const CompanyPendingInvitesList = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { invites = [], loading, error } = usePendingInvites();

  const filteredInvites = Array.isArray(invites)
    ? invites.filter((inviteItem) => {
        // Additional safety check for invite object
        if (!inviteItem || typeof inviteItem !== "object") {
          return false;
        }

        // If search is empty, show all
        if (!searchQuery.trim()) {
          return true;
        }

        const searchTerm = searchQuery.toLowerCase();

        // Safe string extraction with multiple fallbacks
        const sender =
          inviteItem.sender_name && typeof inviteItem.sender_name === "string"
            ? inviteItem.sender_name.toLowerCase()
            : "";

        const company =
          inviteItem.company_name && typeof inviteItem.company_name === "string"
            ? inviteItem.company_name.toLowerCase()
            : "";

        // Only perform includes if we have valid strings and search term
        return (
          (sender.length > 0 && sender.includes(searchTerm)) ||
          (company.length > 0 && company.includes(searchTerm))
        );
      })
    : [];

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={colors.danger}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (loading && invites.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!loading && invites.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons
          name="email-open-outline"
          size={72}
          color={colors.lightGrey}
        />
        <Text style={styles.emptyText}>{t("no pending invites")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.grey}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={t("search invites")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor={colors.grey}
        />
      </View>

      <FlatList
        data={filteredInvites}
        keyExtractor={(item, index) => {
          // Better key extraction with fallbacks
          if (item?.id) {
            return typeof item.id === "string" ? item.id : String(item.id);
          }
          return `invite-${index}`;
        }}
        renderItem={({ item }) => <PendingInviteItem invite={item} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
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
  emptyText: {
    color: colors.grey,
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.darkText,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default CompanyPendingInvitesList;
