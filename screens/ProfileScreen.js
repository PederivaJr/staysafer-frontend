import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { vh } from "react-native-expo-viewport-units";
import { AuthContext } from "../context/AuthContext";
import Icon from "../components/Icon";
import ProfileListItem from "../components/ProfileListItem";
import colors from "../config/color";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import storage from "../auth/storage";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-root-toast";
import getProfileApi from "../api/getProfile";
import deleteUserApi from "../api/deleteUser";
import OptionMenuProfile from "../components/OptionMenuProfile";

function ProfileScreen({ navigation, route }) {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  // Show toast after profile update
  useEffect(() => {
    if (route?.params?.profile_update === "success") {
      Toast.show(t("toast profile updated"), {
        duration: Toast.durations.LONG,
      });
    }
  }, [route]);
  // Get profile on mount
  useEffect(() => {
    const getProfile = async () => {
      const result = await getProfileApi.getProfile(authContext.user.id);
      //console.log("get profile API: ", JSON.stringify(result, null, 2));
      if (result.data?.user) {
        authContext.setUser(result.data.user);
      }
    };

    getProfile();
  }, []);

  const goToEditProfile = () => {
    navigation.navigate("edit profile");
  };
  const goToPurchase = () => {
    navigation.navigate("purchase");
  };
  const confirmDeleteProfile = () => {
    Alert.alert(
      t("confirm delete"),
      t("confirm delete message"),
      [
        {
          text: t("back"),
          style: "cancel",
        },
        {
          text: t("ok"),
          onPress: deleteProfile,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  const deleteProfile = async () => {
    const result = await deleteUserApi.deleteUser(authContext.user.id);
    console.log("delete user api: ", result);
    // Remove user and token on success
    authContext.setUser(null);
    storage.removeToken();
  };
  const handleAction = (action) => {
    if (action === "edit") goToEditProfile();
    if (action === "remove") confirmDeleteProfile();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.iconContainer}>
          <OptionMenuProfile onSelectAction={handleAction} />
        </View>
        <View>
          <ProfileListItem
            ImageComponent={
              <Icon
                name="human-male-female"
                size={56}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("profile full name")}
            description={
              authContext.user.firstname +
              (authContext.user.lastname ? ` ${authContext.user.lastname}` : "")
            }
          />
          <ProfileListItem
            ImageComponent={
              <Icon
                name="email"
                size={56}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("profile email")}
            description={authContext.user.email}
          />
          <ProfileListItem
            ImageComponent={
              <Icon
                name="phone"
                size={56}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("profile phone")}
            description={authContext.user.phone_number}
          />
          <ProfileListItem
            ImageComponent={
              <Icon
                name="factory"
                size={56}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("profile company")}
            description={
              authContext.user?.company?.name &&
              authContext.user.company.name !== "no company"
                ? authContext.user.company.name
                : t("no company name set")
            }
          />
          <ProfileListItem
            ImageComponent={
              <Icon
                name={
                  !authContext.plan?.name
                    ? "user-lock"
                    : authContext.plan.name.toLowerCase() === "collaborator"
                      ? "users-rays"
                      : "user-tie"
                }
                family="fontAwesome6"
                size={56}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={t("profile role")}
            description={authContext.user.role}
          />
          {authContext.markers?.some(
            (marker) => marker.assigned_to === authContext.user.id
          ) && (
            <ProfileListItem
              ImageComponent={
                <Icon
                  name="map-marker-radius"
                  size={56}
                  backgroundColor="transparent"
                  iconColor={colors.grey}
                />
              }
              title={t("assigned evacuation point")}
              description={
                authContext.markers.find(
                  (marker) => marker.assigned_to === authContext.user.id
                )?.title
              }
            />
          )}
          <ProfileListItem
            ImageComponent={
              <Icon
                name="money-check-alt"
                family="fontAwesome5"
                size={56}
                backgroundColor="transparent"
                iconColor={colors.grey}
              />
            }
            title={
              t("profile plan") +
              " (" +
              (authContext.plan.active ? t("active") : t("not active")) +
              ")"
            }
            subtitle={
              t("plan") +
              ": " +
              t(authContext.plan?.name ? authContext.plan.name : "no plan")
            }
            description={
              authContext.plan.free_trial_status === "ongoing"
                ? t("free trial ongoing")
                : null
            }
            expire={true}
            extraContent={t("change plan")}
            onPress={goToPurchase}
          />
          {authContext.user.affiliated_to && (
            <ProfileListItem
              ImageComponent={
                <Icon
                  name="user-tag"
                  family="fontAwesome5"
                  size={56}
                  backgroundColor="transparent"
                  iconColor={colors.grey}
                />
              }
              title={t("affiliated to")}
              description={authContext.user.affiliated_to}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.lighterGrey,
  },
  iconContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
});

export default ProfileScreen;
