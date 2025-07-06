import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/ProfileScreen";
import AppNavigator from "./AppNavigator";
import SetupScreen from "../screens/SetupScreen";
import ManageSafetyMethodScreen from "../screens/ManageSafetyMethodScreen";
import ManageDescriptionScreen from "../screens/ManageDescriptionScreen";
import ManageMapScreen from "../screens/ManageMapScreen";
import OfflineSyncScreen from "../screens/OfflineSyncScreen";
import ManageSystemScreen from "../screens/ManageSystemScreen";
import PushNotificationScreen from "../screens/PushNotificationScreen";
import ManageProfileScreen from "../screens/ManageProfileScreen";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import CompanyInviteEmailScreen from "../screens/CompanyInviteEmailScreen";
import CompanyInviteScanQrScreen from "../screens/CompanyInviteScanQrScreen";
import CompanyInviteQrScreen from "../screens/CompanyInviteQrScreen";
import CompanyUsersScreen from "../screens/CompanyUsersScreen";
import ManageCompanyUsersRolesScreen from "../screens/ManageCompanyUsersRolesScreen";
import ManageEvacSetupScreen from "../screens/ManageEvacSetupScreen";
import ManageCompanyPendingInvitesScreen from "../screens/ManageCompanyPendingInvitesScreen";
import CompanyInviteHistoryScreen from "../screens/CompanyInviteHistoryScreen";
import HelpScreen from "../screens/HelpScreen";
import SelectedUsersScreen from "../screens/SelectedUsersScreen";
import PurchaseScreen from "../screens/PurchaseScreen";
import { AuthContext } from "../context/AuthContext";
import ManageTempContact from "../screens/ManageTempContact";
import ManageShortcutsScreen from "../screens/ManageShortcutsScreen";
import ManageLocalContact from "../screens/ManageLocalContact";
import StatisticsScreen from "../screens/StatisticsScreen";
import EventsHistoryScreen from "../screens/EventsHistoryScreen";
import SelectedUsersScreenDrill from "../screens/SelectedUsersScreenDrill";
import ManageBeaconsScreen from "../screens/ManageBeaconsScreen";
import ManageBeaconsNavigationScreen from "../screens/ManageBeaconsNavigationScreen";

const Stack = createStackNavigator();

const OptionNavigator = (props) => {
  const { t, i18n } = useTranslation();
  const authContext = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Main"
        component={AppNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
        options={{ headerShown: true, headerTitle: t("header profile") }}
      />
      <Stack.Screen
        name="edit profile"
        component={ManageProfileScreen}
        options={{ headerShown: true, headerTitle: t("header edit profile") }}
      />
      <Stack.Screen
        name="setup"
        component={SetupScreen}
        options={{ headerShown: true, headerTitle: t("header setup") }}
      />
      <Stack.Screen
        name="evac list"
        component={SelectedUsersScreen}
        options={{ headerShown: true, headerTitle: t("header evac list") }}
      />
      <Stack.Screen
        name="safety methods"
        component={ManageSafetyMethodScreen}
        options={{ headerShown: true, headerTitle: t("header safety methods") }}
      />
      <Stack.Screen
        name="directions"
        component={ManageDescriptionScreen}
        options={{ headerShown: true, headerTitle: t("header directions") }}
      />
      <Stack.Screen
        name="evac point"
        component={ManageMapScreen}
        options={{ headerShown: true, headerTitle: t("header evac point") }}
      />
      <Stack.Screen
        name="Sync offline (BETA)"
        component={OfflineSyncScreen}
        options={{ headerShown: true, headerTitle: t("header system") }}
      />
      <Stack.Screen
        name="Push notification (BETA)"
        component={PushNotificationScreen}
        options={{
          headerShown: true,
          headerTitle: t("header push notification"),
        }}
      />
      <Stack.Screen
        name="system"
        component={ManageSystemScreen}
        options={{ headerShown: true, headerTitle: t("header system") }}
      />
      <Stack.Screen
        name="company invite mail"
        component={CompanyInviteEmailScreen}
        options={{ headerShown: true, headerTitle: t("header company invite") }}
      />
      <Stack.Screen
        name="scan qr"
        component={CompanyInviteScanQrScreen}
        options={{ headerShown: true, headerTitle: t("header scan qr") }}
      />
      <Stack.Screen
        name="show qr"
        component={CompanyInviteQrScreen}
        options={{ headerShown: true, headerTitle: t("header show qr") }}
      />
      <Stack.Screen
        name="company users"
        component={CompanyUsersScreen}
        options={{ headerShown: true, headerTitle: t("header company users") }}
      />
      <Stack.Screen
        name="company manage roles"
        component={ManageCompanyUsersRolesScreen}
        options={{ headerShown: true, headerTitle: t("header company roles") }}
      />
      <Stack.Screen
        name="company pending invites"
        component={ManageCompanyPendingInvitesScreen}
        options={{
          headerShown: true,
          headerTitle: t("header pending invites"),
        }}
      />
      <Stack.Screen
        name="evac overview"
        component={ManageEvacSetupScreen}
        options={{ headerShown: true, headerTitle: t("header manage evac") }}
      />
      <Stack.Screen
        name="invite history"
        component={CompanyInviteHistoryScreen}
        options={{ headerShown: true, headerTitle: t("header invite history") }}
      />
      <Stack.Screen
        name="help overview"
        component={HelpScreen}
        options={{ headerShown: true, headerTitle: t("header help overview") }}
      />
      <Stack.Screen
        name="purchase"
        component={PurchaseScreen}
        options={{ headerShown: true, headerTitle: t("header purchase") }}
      />
      <Stack.Screen
        name="edit temp contact"
        component={ManageTempContact}
        options={{
          headerShown: true,
          headerTitle: t("header edit temp contact"),
        }}
      />
      <Stack.Screen
        name="shortcuts"
        component={ManageShortcutsScreen}
        options={{ headerShown: true, headerTitle: t("header shortcuts") }}
      />
      <Stack.Screen
        name="edit local contact"
        component={ManageLocalContact}
        options={{
          headerShown: true,
          headerTitle: t("header edit local contact"),
        }}
      />
      <Stack.Screen
        name="statistics"
        component={StatisticsScreen}
        options={{
          headerShown: true,
          headerTitle: t("header statistics"),
        }}
      />
      <Stack.Screen
        name="events history"
        component={EventsHistoryScreen}
        options={{
          headerShown: true,
          headerTitle: t("header events history"),
        }}
      />
      <Stack.Screen
        name="evac list drill"
        component={SelectedUsersScreenDrill}
        options={{
          headerShown: true,
          headerTitle: t("header evac list drill"),
        }}
      />
      <Stack.Screen
        name="beacons (BETA)"
        component={ManageBeaconsScreen}
        options={{
          headerShown: true,
          headerTitle: t("header beacons"),
        }}
      />
      <Stack.Screen
        name="navigation (BETA)"
        component={ManageBeaconsNavigationScreen}
        options={{
          headerShown: true,
          headerTitle: t("header beacons navigation"),
        }}
      />
    </Stack.Navigator>
  );
};

export default OptionNavigator;
