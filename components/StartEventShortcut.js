import React, { useContext, useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
} from "react-native";
import colors from "../config/color";
import { AuthContext } from "../context/AuthContext";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import Icon from "../components/Icon";
import StartEventItem from "../components/StartEventItem";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-root-toast";
import useStartEvent from "../hooks/useStartEvent";
import useEndEvent from "../hooks/useEndEvent";
import useEvacuationStatus from "../hooks/useEvacuationStatus";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome6,
} from "@expo/vector-icons";

function StartEventShortcut() {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { startEvent } = useStartEvent();
  const { endEvent } = useEndEvent();
  const animation = useRef(new Animated.Value(0)).current;

  // Use the real-time evacuation status hook
  const { evacuation, loading, error } = useEvacuationStatus();

  // Update AuthContext when real-time evacuation data changes
  useEffect(() => {
    if (evacuation !== null) {
      console.log(
        "StartEventShortcut: Updating evacuation from real-time data:",
        evacuation
      );
      authContext.setEvacuation(evacuation);
    } else if (!loading && evacuation === null) {
      // Only clear evacuation if we're not loading and definitely no active evacuation
      console.log(
        "StartEventShortcut: Clearing evacuation - no active evacuation found"
      );
      authContext.setEvacuation(null);
    }
  }, [evacuation, loading]);

  // Log evacuation status errors (but don't block UI)
  useEffect(() => {
    if (error) {
      console.warn("StartEventShortcut: Evacuation status error:", error);
    }
  }, [error]);

  const evacListDrill = authContext.evacLists?.find(
    (list) => list.name === "default drill"
  );
  const evacListAlarm = authContext.evacLists?.find(
    (list) => list.name === "default alarm"
  );

  const toggleCollapse = () => {
    authContext.setIsCollapsedShortcuts(!authContext.isCollapsedShortcuts);
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: authContext.isCollapsedShortcuts ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [authContext.isCollapsedShortcuts]);

  const heightInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280], // Adjust the output range as needed
  });

  const toggleEvent = async (eventType) => {
    const isDrill = eventType === "drill";
    const isRealEvent = eventType === "real_event";

    if (isRealEvent && authContext.evacuation?.real_event) {
      endEvent("real_event");
    }
    if (isDrill && authContext.evacuation?.drill) {
      endEvent("drill");
    }
    if (isRealEvent && authContext.evacuation?.drill) {
      Toast.show(t("toast no alarm during drill"), {
        duration: Toast.durations.LONG,
      });
    }
    if (isDrill && authContext.evacuation?.real_event) {
      Toast.show(t("toast no drill during alarm"), {
        duration: Toast.durations.LONG,
      });
    }
    if ((isDrill || isRealEvent) && !authContext.evacuation?.evacuation_id) {
      startEvent(eventType);
    }
  };

  const goToPage = (page, params) => {
    navigation.navigate(page, params);
  };

  if (authContext.plan?.name == "collaborator" || !authContext.plan?.active) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleCollapse}
        style={
          authContext.isCollapsedShortcuts
            ? styles.expandedButton
            : styles.collapsedButton
        }
      >
        <Text
          style={
            authContext.isCollapsedShortcuts
              ? styles.collapseIcon
              : styles.expandIcon
          }
        >
          {!authContext.isCollapsedShortcuts ? (
            <FontAwesome6
              name="caret-up"
              size={36}
              style={styles.collapseArrow}
            />
          ) : (
            <FontAwesome6
              name="caret-down"
              size={36}
              style={styles.collapseArrow}
            />
          )}
        </Text>
      </TouchableOpacity>
      <Animated.View
        style={[styles.shortcutsContainer, { height: heightInterpolation }]}
      >
        {authContext.settings?.shortcuts?.alarm && (
          <StartEventItem
            ImageComponent={
              <Icon
                name="alarm-light-outline"
                size={60}
                backgroundColor={colors.white}
                iconColor={colors.grey}
              />
            }
            title={t("start title alarm")}
            value={authContext.evacuation?.real_event}
            onPress={() => toggleEvent("real_event")}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.drill && (
          <StartEventItem
            ImageComponent={
              <Icon
                name="test-tube"
                size={60}
                backgroundColor={colors.white}
                iconColor={colors.grey}
              />
            }
            title={t("start title drill alarm")}
            value={authContext.evacuation?.drill}
            onPress={() => toggleEvent("drill")}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.evac_list && (
          <StartEventItem
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
            title={t("start title selected")}
            value={authContext.evacuation?.evac_list}
            onPress={() => goToPage("evac list", { list: evacListAlarm })}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.evac_list_drill && (
          <StartEventItem
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
            title={t("start title selected drill")}
            value={authContext.evacuation?.evac_list_drill}
            onPress={() => goToPage("evac list drill", { list: evacListDrill })}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.evac_points && (
          <StartEventItem
            ImageComponent={
              <Icon
                name="map-marked-alt"
                family="fontAwesome5"
                size={60}
                backgroundColor={colors.white}
                iconColor={colors.grey}
              />
            }
            title={t("start title evac point")}
            value={authContext.evacuation?.evac_points}
            onPress={() => goToPage("evac point")}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.company_users && (
          <StartEventItem
            ImageComponent={
              <Icon
                name="account-hard-hat"
                size={60}
                backgroundColor={colors.white}
                iconColor={colors.grey}
              />
            }
            title={t("start title company")}
            value={authContext.evacuation?.company_users}
            onPress={() => goToPage("company manage roles")}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.response_invites && (
          <StartEventItem
            ImageComponent={
              <Icon
                name="mailbox-up"
                size={60}
                backgroundColor={colors.white}
                iconColor={colors.grey}
              />
            }
            title={t("start title invites")}
            value={authContext.evacuation?.response_invites}
            onPress={() => goToPage("company pending invites")}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.directions && (
          <StartEventItem
            ImageComponent={
              <Icon
                name="arrow-decision"
                size={60}
                backgroundColor={colors.white}
                iconColor={colors.grey}
              />
            }
            title={t("start title directions")}
            value={authContext.evacuation?.directions}
            onPress={() => goToPage("directions")}
            noInfo={true}
          />
        )}
        {authContext.settings?.shortcuts?.system_settings && (
          <StartEventItem
            ImageComponent={
              <Icon
                name="cog-outline"
                size={60}
                backgroundColor={colors.white}
                iconColor={colors.grey}
              />
            }
            title={t("start title system")}
            value={authContext.evacuation?.system_settings}
            onPress={() => goToPage("system")}
            noInfo={true}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  shortcutsContainer: {
    overflow: "hidden", // Ensure content does not overflow
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  collapseArrow: {
    color: colors.lightGrey,
  },
  collapsedButton: {
    padding: 0,
    margin: 0,
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
  },
  expandedButton: {
    padding: 0,
    margin: 0,
    backgroundColor: colors.primary,
    borderTopColor: colors.lightGrey,
    borderTopWidth: 1,
  },
  collapseIcon: {
    color: colors.lightGrey,
    textAlign: "center",
    fontSize: 16,
    padding: 0,
    margin: 0,
    transform: [{ translateY: -15 }],
  },
  expandIcon: {
    color: colors.lightGrey,
    textAlign: "center",
    fontSize: 16,
    padding: 0,
    margin: 0,
    transform: [{ translateY: 15 }],
  },
  doubleIconLeft: {},
  doubleIconRight: {
    position: "absolute",
    left: 34,
  },
});

export default StartEventShortcut;
