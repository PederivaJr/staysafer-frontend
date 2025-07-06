import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Icon from "../components/Icon";
import SetupListItem from "../components/SetupListItem";
import ArrowListItem from "../components/ArrowListItem";
import { useTranslation } from "react-i18next";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import "../config/lang/i18n";
import { AuthContext } from "../context/AuthContext";
import useStartEvent from "../hooks/useStartEvent";
import useEndEvent from "../hooks/useEndEvent";

function ManageEvacSetupScreen({ route, navigation }) {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { startEvent } = useStartEvent();
  const { endEvent } = useEndEvent();

  // get evac lists
  const evacListDrill = authContext.evacLists?.find(
    (list) => list.name === "default drill"
  );
  const evacListAlarm = authContext.evacLists?.find(
    (list) => list.name === "default alarm"
  );

  useEffect(() => {
    if (route?.params?.description === "success") {
      Toast.show(t("toast description successful"), {
        duration: Toast.durations.LONG,
      });
    }
  }, [route, t]);

  const handleToggleEvent = async (eventType) => {
    if (eventType === "real_event") {
      if (authContext.evacuation?.real_event) endEvent("real_event");
      if (!authContext.evacuation?.real_event) startEvent("real_event");
    }
    if (eventType === "drill") {
      if (authContext.evacuation?.drill) endEvent("drill");
      if (!authContext.evacuation?.drill) startEvent("drill");
    }
  };
  const goToPage = (page, params) => {
    navigation.navigate(page, params);
  };

  return (
    <View style={styles.container}>
      {authContext.user.role !== "collaborator" && authContext.plan.active && (
        <SetupListItem
          ImageComponent={
            <Icon
              name="alarm-light-outline"
              size={64}
              backgroundColor={
                authContext.evacuation?.real_event ? "transparent" : colors.grey
              }
              iconColor={
                authContext.evacuation?.real_event
                  ? colors.darkRed
                  : colors.lighterGrey
              }
            />
          }
          title={t("setup title alarm")}
          description={
            authContext.evacuation?.real_event
              ? t("setup description alarm end")
              : t("setup description alarm start")
          }
          value={authContext.evacuation?.real_event}
          onValueChange={() => handleToggleEvent("real_event")}
        />
      )}
      {authContext.user.role !== "collaborator" && authContext.plan?.active && (
        <SetupListItem
          ImageComponent={
            <Icon
              name="test-tube"
              size={64}
              backgroundColor={
                authContext.evacuation?.drill ? "transparent" : colors.grey
              }
              iconColor={
                authContext.evacuation?.drill
                  ? colors.darkYellow
                  : colors.lighterGrey
              }
            />
          }
          title={t("setup title drill alarm")}
          description={
            authContext.evacuation?.drill
              ? t("setup description drill alarm end")
              : t("setup description drill alarm start")
          }
          value={authContext.evacuation?.drill}
          onValueChange={() => handleToggleEvent("drill")}
        />
      )}
      {authContext.user.role != "collaborator" && authContext.plan.active && (
        <ArrowListItem
          ImageComponent={
            <View style={styles.doubleIcon}>
              <View style={styles.doubleIconLeft}>
                <Icon
                  name="exit-run"
                  size={64}
                  backgroundColor="transparent"
                  iconColor={colors.grey}
                  rotate={true}
                />
              </View>
              <View style={styles.doubleIconRight}>
                <Icon
                  name="alarm-light-outline"
                  size={32}
                  backgroundColor="transparent"
                  iconColor={colors.grey}
                  rotate={false}
                />
              </View>
            </View>
          }
          title={t("setup title evac list")}
          description={t("setup description evac list")}
          onPress={() => goToPage("evac list", { list: evacListAlarm })}
        />
      )}
      {authContext.user.role != "collaborator" && authContext.plan.active && (
        <ArrowListItem
          ImageComponent={
            <View style={styles.doubleIcon}>
              <View style={styles.doubleIconLeft}>
                <Icon
                  name="exit-run"
                  size={64}
                  backgroundColor="transparent"
                  iconColor={colors.grey}
                  rotate={true}
                />
              </View>
              <View style={styles.doubleIconRight}>
                <Icon
                  name="test-tube"
                  size={32}
                  backgroundColor="transparent"
                  iconColor={colors.grey}
                  rotate={false}
                />
              </View>
            </View>
          }
          title={t("setup title evac list drill")}
          description={t("setup description evac list drill")}
          onPress={() => goToPage("evac list drill", { list: evacListDrill })}
        />
      )}
      {authContext.user.role != "collaborator" && authContext.plan.active && (
        <ArrowListItem
          ImageComponent={
            <Icon
              family="fontAwesome5"
              name="map-marked-alt"
              size={64}
              backgroundColor="transparent"
              iconColor={colors.grey}
            />
          }
          title={t("setup title evac point")}
          description={t("setup description evac point")}
          onPress={() => goToPage("evac point")}
        />
      )}
      {authContext.user.role != "collaborator" && authContext.plan.active && (
        <ArrowListItem
          ImageComponent={
            <Icon
              name="arrow-decision"
              size={64}
              backgroundColor="transparent"
              iconColor={colors.grey}
            />
          }
          title={t("setup title directions")}
          description={t("setup description directions")}
          onPress={() => goToPage("directions")}
        />
      )}
      {authContext.user.role != "collaborator" && authContext.plan.active && (
        <ArrowListItem
          ImageComponent={
            <Icon
              name="account-check-outline"
              size={64}
              backgroundColor="transparent"
              iconColor={colors.grey}
            />
          }
          title={t("setup title safety methods")}
          description={t("setup description safety methods")}
          onPress={() => goToPage("safety methods")}
        />
      )}
      {authContext.user.role != "collaborator" && authContext.plan.active && (
        <ArrowListItem
          ImageComponent={
            <Icon
              name="chart-bar"
              size={64}
              backgroundColor="transparent"
              iconColor={colors.grey}
            />
          }
          title={t("setup title event history")}
          description={t("setup description event history")}
          onPress={() => goToPage("events history")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  doubleIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "relative",
  },
  doubleIconLeft: {},
  doubleIconRight: {
    position: "absolute",
    left: 34,
  },
});

export default ManageEvacSetupScreen;
