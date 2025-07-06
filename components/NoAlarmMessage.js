import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from "react-native";
import RoundedIcon from "./RoundedIcon";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import StartEventShortcut from "./StartEventShortcut";
import { AuthContext } from "../context/AuthContext";
import StartEventItem from "./StartEventItem";
import Icon from "./Icon";
import { useNavigation } from "@react-navigation/native";

function NoAlarmMessage() {
  const { t, i18n } = useTranslation();
  const authContext = useContext(AuthContext);
  const navigation = useNavigation();
  // Create an animated value
  const scaleValue = useRef(new Animated.Value(0)).current;
  const [animationKey, setAnimationKey] = useState(0);
  const [hasActiveShortcut, setHasActiveShortcut] = useState(null);

  // check if at least 1 shortcut is active, to decide wheter to show shortcuts box
  useEffect(() => {
    if (authContext.settings?.shortcuts) {
      const checkShortcut = Object.values(authContext.settings?.shortcuts).some(
        (value) => value === true
      );
      setHasActiveShortcut(checkShortcut);
    }
  }, [authContext.settings]);
  // start animation
  const startAnimation = () => {
    scaleValue.setValue(0);
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 2,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };
  // trigger animation on click
  useEffect(() => {
    startAnimation();
  }, [animationKey]);
  // handle icon click to animate
  const handleIconPress = () => {
    setAnimationKey((prevKey) => prevKey + 1);
  };
  // navigate to page
  const goToPage = (page) => {
    navigation.navigate(page);
  };

  return (
    <View style={styles.container}>
      <View style={styles.noAlarm}>
        <Pressable onPress={handleIconPress}>
          <View>
            <Animated.View
              style={{ transform: [{ scale: scaleValue }], padding: 40 }}
            >
              <RoundedIcon name="check" color={colors.brightGreen} size={120} />
            </Animated.View>
          </View>
        </Pressable>
        <View style={styles.textContainer}>
          <Text style={styles.noAlarmText}>{t("no alarm active")}</Text>
          <Text style={styles.noAlarmText}>{t("have a nice day")}</Text>
        </View>
      </View>
      {authContext.pendingInvites?.filter(
        (invite) => invite.type === "received"
      ).length > 0 && (
        <View style={styles.messages}>
          <StartEventItem
            ImageComponent={
              <Icon
                name="mailbox-up"
                size={56}
                backgroundColor={colors.lighterGrey}
                iconColor={colors.grey}
                border={colors.lighterGrey}
              />
            }
            title={t("start title incoming invite")}
            onPress={() => goToPage("company pending invites")}
            noInfo={false}
          />
        </View>
      )}
      {authContext.plan?.active &&
        authContext.user?.role !== "collaborator" &&
        authContext.user?.role !== "guest" &&
        hasActiveShortcut && (
          <View style={styles.shortcuts}>
            <StartEventShortcut />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
    marginBottom: 0,
  },
  messages: {
    paddingHorizontal: 16,
    width: "90%",
  },
  noAlarm: {
    flex: 0,
    flexGrow: 0,
    flexBasis: "auto",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  shortcuts: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 1,
    marginTop: 0,
  },
  textContainer: {
    paddingVertical: 16,
  },
  noAlarmText: {
    fontSize: 24,
    textAlign: "center",
  },
});

export default NoAlarmMessage;
