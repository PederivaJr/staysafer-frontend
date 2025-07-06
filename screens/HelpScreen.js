import React, { useState, useContext } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import Icon from "../components/Icon";
import ArrowListItem from "../components/ArrowListItem";
import { AuthContext } from "../context/AuthContext";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import Screen from "../components/Screen";

function HelpScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const goPrivacyPolicy = () => {
    Linking.openURL("https://www.staysafer.ch/Terms&Policy_en.html");
  };

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
      {!loading && (
        <View style={styles.container}>
          <ArrowListItem
            ImageComponent={
              <Icon
                name="file-document-outline"
                size={64}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("help title privacy")}
            description={t("help description privacy")}
            onPress={goPrivacyPolicy}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lighterGrey,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HelpScreen;
