import React, { useContext } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import { AuthContext } from "../context/AuthContext";
import AuthNavigator from "../navigation/AuthNavigator";
import OptionNavigator from "../navigation/OptionNavigator";
import colors from "../config/color";
import useInitData from "../hooks/useInitData";

import useCheckAuthToken from "../hooks/useCheckAuthToken";
import useAppsFlyer from "../hooks/useAppsFlyer";
import useNotificationManager from "../hooks/useNotificationManager";
import useLanguage from "../hooks/useLanguage";
// import useInitData from "../hooks/useInitData"; // ← REMOVED
import useAppStatusChecker from "../hooks/useAppStatusChecker";
import useUpdateInit from "../hooks/useUpdateInit";
import useCompanyUsers from "../hooks/useCompanyUsers"; // ← ADDED for real-time role updates
import useEvacListUsers from "../hooks/useEvacListUsers"; // ← ADDED for real-time evac data
import useEvacPoints from "../hooks/useEvacPoints"; // ← ADDED for real-time evac points

const AppContent = () => {
  const { user, appLoading } = useContext(AuthContext);

  // call hooks to initialize app (token, language, notifications, affiliation)
  useCheckAuthToken();
  useInitData();
  //useUpdateInit();
  useAppsFlyer();
  useNotificationManager();
  useLanguage();
  useAppStatusChecker();

  // ✅ NEW: Real-time hooks that replace useInitData functionality
  //useCompanyUsers(); // Updates user roles, company users, and evac points in real-time
  //useEvacListUsers(); // Updates evac lists, temp contacts, selected users in real-time
  //useEvacPoints(); // Updates evacuation points in real-time

  return appLoading ? (
    <ActivityIndicator
      style={styles.loading}
      animating={true}
      size="large"
      color={colors.brightGreen}
    />
  ) : (
    <NavigationContainer>
      {user ? <OptionNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
});

export default AppContent;
