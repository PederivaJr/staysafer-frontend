import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import Toast from "react-native-root-toast";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const EventHistoryItem = ({ event }) => {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const showStats = () => {
    navigation.navigate("statistics", { event: event });
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftWrapper}>
        <View style={styles.dataRow}>
          <Text style={styles.rowLabel}>{t("id")}:</Text>
          <Text>{event.id}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.rowLabel}>{t("date")}:</Text>
          <Text>{event.date.replace(" ", " - ")}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.rowLabel}>{t("type")}:</Text>
          <Text>{t(event.type)}</Text>
        </View>
      </View>
      <View style={styles.rightWrapper}>
        <TouchableHighlight
          underlayColor="#f0f0f0"
          activeOpacity={0.7}
          onPress={showStats}
          style={styles.iconButton}
        >
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={32}
              color={colors.grey}
            />
          </View>
        </TouchableHighlight>
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
    paddingLeft: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lightGrey,
  },
  leftWrapper: {
    flexGrow: 1,
  },
  icon: {
    alignItems: "center",
  },
  dataRow: {
    flexDirection: "row",
  },
  rowLabel: {
    flexBasis: 56,
    fontWeight: "bold",
  },
  period: {
    color: colors.darkGrey,
  },
  periodLabel: {
    color: colors.darkGrey,
    flexBasis: 64,
  },
  rightWrapper: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 0,
  },
  iconButton: {
    padding: 8,
  },
});

export default EventHistoryItem;
