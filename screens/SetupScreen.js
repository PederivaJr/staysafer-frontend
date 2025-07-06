import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { vh, vw, em, vmin, vmax } from "react-native-expo-viewport-units";
import Icon from "../components/Icon";
import SetupListItem from "../components/SetupListItem";
import ArrowListItem from "../components/ArrowListItem";
import { AuthContext } from "../context/AuthContext";
import cache from "../utility/cache";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";
import Screen from "../components/Screen";

function SetupScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (route?.params?.description === "success") {
      // Add a Toast to notify user.
      Toast.show(t("toast description successful"), {
        duration: Toast.durations.LONG,
      });
    }
  }, []);

  const goToPage = (page) => {
    navigation.navigate(page);
  };

  return (
    <View style={styles.container}>
      <ArrowListItem
        ImageComponent={
          <Icon
            name="cog-outline"
            size={64}
            backgroundColor="transparent"
            iconColor={colors.grey}
          />
        }
        title={t("setup title system")}
        description={t("setup description system")}
        onPress={() => goToPage("system")}
      />
      {authContext.plan.active && (
        <ArrowListItem
          ImageComponent={
            <Icon
              name="factory"
              size={64}
              backgroundColor="transparent"
              iconColor={colors.grey}
            />
          }
          title={t("setup title company users")}
          description={t("setup description company users")}
          onPress={() => goToPage("company users")}
        />
      )}
      {authContext.user.role !== "guest" &&
        authContext.user.role !== "collaborator" &&
        authContext.plan.active && (
          <ArrowListItem
            ImageComponent={
              <Icon
                name="alarm-light-outline"
                size={64}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("setup title evac")}
            description={t("setup description evac")}
            onPress={() => goToPage("evac overview")}
          />
        )}
      <ArrowListItem
        ImageComponent={
          <Icon
            name="help-circle-outline"
            size={64}
            backgroundColor="transparent"
            iconColor={colors.grey}
          />
        }
        title={t("setup title help")}
        description={t("setup description help")}
        onPress={() => goToPage("help overview")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lighterGrey,
  },
});

export default SetupScreen;
