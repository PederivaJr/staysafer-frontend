import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ToastAndroid } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import { COMPARE_ID, COMPARE_NAMES } from "../config/globals";
import OptionMenuManageInvitesReceived from "./OptionMenuManageInvitesReceived";
import OptionMenuManageInvitesSent from "./OptionMenuManageInvitesSent";
import createInviteResponseApi from "../api/createInviteResponse";
import deletePendingInviteApi from "../api/deletePendingInvite";
import { formatDurationInvites } from "../utils/dateHelper";

const PendingInviteItem = ({ invite }) => {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const [processing, setProcessing] = useState(false);

  console.log("PendingInviteItem mounted with:", invite);

  // Guard against missing or bad invite shape
  if (!invite || typeof invite !== "object" || !invite.hasOwnProperty("id")) {
    console.warn("Invalid invite structure detected", invite);
    return null;
  }

  const inviteType = invite.type === "sent" ? "sent" : "received";

  // Safe extraction of sender name
  const senderName =
    invite.sender_name && typeof invite.sender_name === "string"
      ? invite.sender_name
      : t("unknown_user");

  // Safe extraction of company name
  const companyName =
    invite.company_name && typeof invite.company_name === "string"
      ? invite.company_name
      : t("unknown_company");

  // Create the invite message similar to the original
  let inviteMessage = null;
  if (invite.sender_name && invite.company_name) {
    if (invite.company_name !== "no company") {
      inviteMessage = `${senderName} ${t("has invited you to join")} ${companyName}`;
    } else {
      inviteMessage = `${senderName} ${t("has invited you to join his/her company")}`;
    }
    if (invite.type === "sent") {
      inviteMessage = t("you invited a user to join your company");
    }
  } else {
    // Fallback message format
    inviteMessage =
      inviteType === "sent"
        ? t("invite.sent_message")
        : t("invite.received_message", {
            sender: senderName,
            company: companyName,
          });
  }

  // ✅ NEW: Calculate duration dynamically on frontend
  const calculateInviteDuration = () => {
    if (!invite.created_at) {
      // Fallback to static data if no created_at
      return {
        number: invite.invite?.number || 0,
        period: invite.invite?.period || "hours",
      };
    }

    // Parse the created_at date and calculate duration
    const createdDate = new Date(invite.created_at);
    return formatDurationInvites(createdDate);
  };

  const duration = calculateInviteDuration();

  const handleAction = async (action) => {
    if (processing) return;
    setProcessing(true);

    try {
      if (action === "reject" || action === "accept") {
        // Handle invite response (accept/reject) via backend API
        const data = {
          invite_id: invite.id,
          response: action,
        };

        console.log("Calling createInviteResponse API with:", data);
        const result = await createInviteResponseApi.createInviteResponse(data);

        console.log(
          "createInviteResponse result:",
          JSON.stringify(result, null, 2)
        );

        if (result.ok) {
          // Update local state with backend response
          if (result.data?.invites) {
            const sortedInvites = result.data.invites.sort(COMPARE_ID);
            authContext.setPendingInvites(sortedInvites);
          }
          if (result.data?.company_users) {
            const sortedUsers = result.data.company_users.sort(COMPARE_NAMES);
            authContext.setCompanyUsers(sortedUsers);
          }
          if (result.data?.user) {
            authContext.setUser(result.data.user);
          }

          ToastAndroid.show(
            t("toast invite managed successfully"),
            ToastAndroid.LONG
          );
        } else {
          // Handle API error
          const errorMessage = result.data?.error_code
            ? t(result.data.error_code)
            : t("toast error general");
          ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        }
      }

      if (action === "remove") {
        // Handle invite removal (for sent invites) via backend API
        console.log(
          "Calling deletePendingInvite API with invite ID:",
          invite.id
        );
        const result = await deletePendingInviteApi.deletePendingInvite(
          invite.id
        );

        console.log(
          "deletePendingInvite result:",
          JSON.stringify(result, null, 2)
        );

        if (result.ok) {
          // Update local state with backend response
          if (result.data?.invites) {
            const sortedInvites = result.data.invites.sort(COMPARE_ID);
            authContext.setPendingInvites(sortedInvites);
          }
          if (result.data?.user) {
            authContext.setUser(result.data.user);
          }

          ToastAndroid.show(
            t("toast invite removed successfully"),
            ToastAndroid.SHORT
          );
        } else {
          // Handle API error
          const errorMessage = result.data?.error_code
            ? t(result.data.error_code)
            : t("toast error general");
          ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        }
      }
    } catch (error) {
      console.error("Invite action failed:", error);
      ToastAndroid.show(t("toast error general"), ToastAndroid.SHORT);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconLeft}>
        <MaterialCommunityIcons
          name={
            inviteType === "sent"
              ? "email-send-outline"
              : "email-receive-outline"
          }
          size={28}
          color={colors.grey}
        />
      </View>

      <View style={styles.inviteData}>
        <Text style={styles.message}>{inviteMessage}</Text>

        <View style={styles.contactRow}>
          <Text style={styles.periodLabel}>
            {t(invite.type)}
            {": "}
          </Text>
          <Text style={styles.period}>
            {invite.invite?.date ||
              new Date(invite.created_at).toLocaleDateString("en-GB")}{" "}
            {"("}
            {duration.number === 0 && duration.period === "hours"
              ? "< 1 " + t("hour")
              : duration.period === "yesterday"
                ? t("yesterday")
                : `${duration.number} ${t(duration.period)}`}
            {duration.period !== "yesterday" ? " " + t("ago") : ""}
            {")"}
          </Text>
        </View>
      </View>

      <View style={styles.iconRight}>
        {inviteType === "sent" ? (
          <OptionMenuManageInvitesSent
            onSelectAction={handleAction}
            disabled={processing}
          />
        ) : (
          <OptionMenuManageInvitesReceived
            onSelectAction={handleAction}
            disabled={processing}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  iconLeft: {
    padding: 8,
  },
  iconRight: {
    padding: 8,
  },
  inviteData: {
    flexGrow: 1,
    flex: 1,
    justifyContent: "center",
    paddingLeft: 8,
  },
  contactRow: {
    flexDirection: "row",
  },
  period: {
    color: colors.darkGrey,
  },
  periodLabel: {
    color: colors.darkGrey,
    flexBasis: 68,
  },
  message: {
    color: colors.darkerGrey,
    fontSize: 15,
  },
});

export default PendingInviteItem;
