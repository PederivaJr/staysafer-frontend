import React, { useContext, useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/AuthContext";
import DescriptionScreen from "../screens/DescriptionScreen";
import MapScreen from "../screens/MapScreen";
import ManageNFCScreen from "../screens/ManageNFCScreen";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import colors from "../config/color";
import SelectedUsersCheckinsScreen from "../screens/SelectedUsersCheckinsScreen";

const Tab = createBottomTabNavigator();

function AppNavigator({ navigation, route }) {
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  //console.log("context plan is: ", JSON.stringify(authContext.plan, null, 2));
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === t("tab map")) {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === t("tab people")) {
            iconName = focused
              ? "account-supervisor"
              : "account-supervisor-outline";
          } else if (route.name === t("tab directions")) {
            iconName = focused ? "arrow-decision" : "arrow-decision-outline";
          } else if (route.name === t("tab nfc")) {
            iconName = focused ? "nfc" : "nfc";
          }
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: colors.darkGrey,
        tabBarInactiveTintColor: colors.grey,
      })}
    >
      <Tab.Screen
        name={t("tab map")}
        component={MapScreen}
        options={{ headerShown: false }}
      />
      {authContext.plan?.active &&
        authContext.evacuation?.evacuation_id &&
        authContext.markers?.some((marker) => marker.directions) && (
          <Tab.Screen
            name={t("tab directions")}
            component={DescriptionScreen}
            options={{ headerShown: false }}
          />
        )}
      {authContext.plan?.active &&
        authContext.evacuation?.evacuation_id &&
        authContext.user.role != "guest" &&
        authContext.user.role != "collaborator" && (
          <Tab.Screen
            name={t("tab people")}
            component={SelectedUsersCheckinsScreen}
            options={{ headerShown: false }}
          />
        )}
      {authContext.plan?.active &&
        authContext.evacuation?.evacuation_id &&
        authContext?.settings?.nfc_active && (
          <Tab.Screen
            name={t("tab nfc")}
            component={ManageNFCScreen}
            options={{ headerShown: false }}
          />
        )}
    </Tab.Navigator>
  );
}

export default AppNavigator;
