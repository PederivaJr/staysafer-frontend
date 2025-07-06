import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import Toast from "react-native-root-toast";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
const InviteHistoryItem = ({ invite }) => {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  const managePeriodFormat = (number, period, status, type) => {
    let periodFormattedText = "";
    switch (type) {
      case "sent":
        periodFormattedText = "";
        break;
      case "response":
        status == "pending"
          ? (periodFormattedText = t("pending"))
          : (periodFormattedText = "");
        break;
      default:
        break;
    }
    if (status === "pending" && type === "response") {
      return periodFormattedText;
    }
    if (number == 1 && period == "day") {
      periodFormattedText += t("yesterday");
      return periodFormattedText;
    }
    if (number == 0 && period == "Today") {
      periodFormattedText += t("today");
      return periodFormattedText;
    }
    if (number > 1 && period == "day") {
      periodFormattedText += `${number} ${t(period)} ${t("ago")}`;
      return periodFormattedText;
    }
    if (number > 0 && period !== "day") {
      periodFormattedText += `${number} ${t(period)} ${t("ago")}`;
      return periodFormattedText;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftWrapper}>
        <View style={styles.row}>
          <Text style={styles.contactLabel}>{t("from")}</Text>
          <Text>{invite.sended_by}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.contactLabel}>{t("to")}</Text>
          <Text>{invite.received_by}</Text>
        </View>
        {invite.invite && (
          <View style={styles.row}>
            <Text style={styles.periodLabel}>
              {t("sent")}
              {": "}
            </Text>
            <Text style={styles.period}>
              {invite.invite.date}
              {invite.invite?.date ? " " : null}
              {invite.invite?.period ? "(" : null}
              {invite.invite.number === 0 && invite.invite?.period === "hours"
                ? "< 1 " + t("hour")
                : null}
              {invite.invite.number > 0 ? invite.invite.number : null}
              {invite.invite?.number ? " " : null}
              {invite.invite.period && invite.invite.number > 0
                ? t(invite.invite.period)
                : invite.invite.period === "yesterday"
                  ? t(invite.invite.period)
                  : null}
              {invite.invite?.period !== "yesterday"
                ? " " + t("ago") + ")"
                : ")"}
            </Text>
          </View>
        )}
        {invite.response && (
          <View style={styles.row}>
            <Text style={styles.periodLabel}>
              {t("response")}
              {": "}
            </Text>
            <Text style={styles.period}>
              {invite.response.date}
              {invite.response?.date ? " " : null}
              {invite.response?.period ? "(" : null}
              {invite.response.number === 0 &&
              invite.response?.period === "hours"
                ? "< 1 " + t("hour")
                : null}
              {invite.response.number > 0 ? invite.response.number : null}
              {invite.response?.number ? " " : null}
              {invite.response.period && invite.response.number > 0
                ? t(invite.response.period)
                : invite.response.period === "yesterday"
                  ? t(invite.response.period)
                  : null}
              {invite.response?.period !== "yesterday"
                ? " " + t("ago") + ")"
                : ")"}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.rightWrapper}>
        {invite.status == "accepted" && (
          <View style={styles.icon}>
            <FontAwesome6
              name="handshake-angle"
              size={16}
              color={colors.green}
            />
          </View>
        )}
        {invite.status == "rejected" && (
          <View style={styles.icon}>
            <FontAwesome6
              name="handshake-simple-slash"
              size={16}
              color={colors.darkRed}
            />
          </View>
        )}
        {invite.status == "pending" && (
          <View style={styles.icon}>
            <FontAwesome6
              name="hourglass-half"
              size={16}
              color={colors.darkYellow}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grey,
  },
  leftWrapper: {
    flexGrow: 1,
  },
  icon: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  contactLabel: {
    flexBasis: 72,
  },
  period: {
    color: colors.darkGrey,
  },
  periodLabel: {
    color: colors.darkGrey,
    flexBasis: 72,
  },
  rightWrapper: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 8,
  },
  accepted: {
    color: colors.brightGreen,
  },
  rejected: {
    color: colors.darkRed,
  },
  pending: {
    color: colors.darkYellow,
  },
});

export default InviteHistoryItem;
