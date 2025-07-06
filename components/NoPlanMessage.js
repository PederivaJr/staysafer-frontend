import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import RoundedIcon from "./RoundedIcon";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import RoundedButton from "./RoundedButton";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

function NoPlanMessage() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const goToPurchaseScreen = () => {
    navigation.navigate("purchase");
  };

  return (
    <View style={styles.noAlarm}>
      <FontAwesome5
        size={104}
        style={styles.subscriptionAlert}
        name="money-check-alt"
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t("no subscription active")}</Text>
        <Text style={styles.desc}>{t("get subscription or free trial")}</Text>
        <TouchableOpacity onPress={goToPurchaseScreen}>
          <Text style={styles.link}>{t("get a plan or a free trial now")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noAlarm: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    paddingVertical: 60,
  },
  textContainer: {
    paddingVertical: 16,
    flex: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: "dodgerblue",
    fontSize: 18,
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  desc: {
    fontSize: 18,
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  subscriptionAlert: {
    color: colors.lightGrey,
  },
});

export default NoPlanMessage;
