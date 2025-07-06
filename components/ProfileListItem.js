import React, { useContext } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import colors from "../config/color";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";

function ProfileListItem({
  title,
  subtitle,
  description,
  ImageComponent,
  extraContent,
  expire,
  onPress,
}) {
  const { t, i18n } = useTranslation();
  const authContext = useContext(AuthContext);

  return (
    <View>
      <View style={styles.container}>
        {ImageComponent}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text>{t(subtitle)}</Text>}
          {description && <Text>{t(description)}</Text>}
          {expire && authContext.plan?.expires_in?.expire_date && (
            <Text>
              {t("expire date")}
              {": "}
              {t(authContext.plan.expires_in?.expire_date)}
              {authContext.plan.expires_in?.number ? " (" : null}
              {authContext.plan.expires_in?.number > 0
                ? authContext.plan.expires_in.number
                : null}{" "}
              {t(authContext.plan.expires_in.period)}
              {authContext.plan.expires_in?.number ? ")" : null}
            </Text>
          )}
          {extraContent && (
            <View style={styles.iconContainer}>
              <Pressable onPress={onPress}>
                <View>
                  <Text style={styles.link}>{extraContent}</Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    gap: 8,

    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    backgroundColor: "transparent",
  },
  iconContainer: {
    paddingTop: 8,
  },
  infoContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  iconStatus: {
    fontSize: 22,
    padding: 4,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 20,
  },
  title: {
    fontWeight: "bold",
  },
  link: {
    color: "dodgerblue",
  },
  expire: {
    color: colors.grey,
  },
});

export default ProfileListItem;
