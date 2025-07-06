import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, StyleSheet } from "react-native";
import AuthNavigator from "./navigation/AuthNavigator";
import OptionNavigator from "./navigation/OptionNavigator";
import AuthContext from "./auth/context";
import storage from "./auth/storage";
import cache from "./utility/cache";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./config/lang/i18n";
import { useTranslation } from "react-i18next";
import getInitApi from "./api/getInit";
import { NativeEventEmitter, NativeModules } from "react-native";
import { LogLevel, OneSignal } from "react-native-onesignal";
import _ from "lodash";
import colors from "./config/color";
import { getLocales } from "expo-localization";
import createAffiliationApi from "./api/createAffiliation";
import appsFlyer from "react-native-appsflyer";
import * as globals from "./config/globals";
import useInitOneSignal from "./hooks/useInitOnesignal";
import Constants from "expo-constants";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.white, // Customize primary color
    accent: colors.brightGreen, // Customize accent color if needed
    surface: colors.white, // White background for menus, dialogs, etc.
  },
};

export default function App() {
  const { t, i18n } = useTranslation();
  const [logout, setLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersDrill, setSelectedUsersDrill] = useState([]);
  const [selectedUsersCheckins, setSelectedUsersCheckins] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [mapRegion, setMapRegion] = useState({});
  const [mapFollowUser, setMapFollowUser] = useState(false);
  const [plan, setPlan] = useState({});
  const [localContacts, setLocalContacts] = useState([]);
  const [tempContacts, setTempContacts] = useState([]);
  const [contactAdded, setContactAdded] = useState(0);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [OSDeviceState, setOSDeviceState] = useState(null);
  const [extUserResponse, setExtUserResponse] = useState(null);
  const [OSevent, setOSevent] = useState(null);
  const [notificationData, setNotificationData] = useState(0);
  const [emailResponse, setEmailResponse] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesHistory, setInvitesHistory] = useState([]);
  const [eventsHistory, setEventsHistory] = useState([]);
  const [storageCheckedForLang, setStorageCheckedForLang] = useState(false);
  const [language, setLanguage] = useState(false);
  const [onesignalInitialized, setOnesignalInitialized] = useState(false);
  const [revenueCatInitialized, setRevenueCatInitialized] = useState(null);
  const [languageLocale, setLanguageLocale] = useState(null);
  const [storeDeepLink, setStoreDeepLink] = useState(null);
  const [appflyerSDK, setAppflyerSDK] = useState(null);
  const [appflyerUserId, setAppflyerUserId] = useState(null);
  const [affiliationId, setAffiliationId] = useState(null);
  const [markersWithDistance, setMarkersWithDistance] = useState([]);
  const [notificationPermissions, setNotificationPermissions] = useState(null);
  const [evacuation, setEvacuation] = useState(null);
  const [isCollapsedShortcuts, setIsCollapsedShortcuts] = useState(false);
  const [initCalled, setInitCalled] = useState(false);
  const [evacLists, setEvacLists] = useState([]);

  // deep links listener, must be before appflyer SDK
  const onDeepLinkCanceller = appsFlyer.onDeepLink((res) => {
    //console.log("listener appsflyer", JSON.stringify(res, null, 2));
    setStoreDeepLink(JSON.stringify(res, null, 2));
    if (res?.deepLinkStatus !== "NOT_FOUND") {
      //const mediaSrc = res?.data.media_source;
      //const deepLinkSub1 = res?.data.deep_link_sub1;
      const deepLinkValue = res?.data.deep_link_value;
      if (deepLinkValue) setAffiliationId(deepLinkValue);
    }
  });
  //set affiliation to backend
  useEffect(() => {
    const abortController = new AbortController();
    const sendData = async () => {
      try {
        const result = await createAffiliationApi.createAffiliation(
          affiliationId,
          user.token,
          { signal: abortController.signal }
        );
        console.log("create affiliation API: ", result);
        if (result.ok) {
          setUser(result.data.user);
        }
      } catch (error) {
        console.log(error);
      } finally {
        abortController.abort();
      }
    };
    if (affiliationId) sendData();

    return () => {
      abortController.abort();
    };
  }, [affiliationId]);
  // appflyer init
  /* useEffect(() => {
    if (user?.id && !appflyerSDK) {
      appsFlyer.initSdk(
        {
          devKey: "VS9BLDHZSWsbYDPr3ZqVnm",
          isDebug: false,
          appId: "6469057429",
          onInstallConversionDataListener: true,
          onDeepLinkListener: true,
          timeToWaitForATTUserAuthorization: 10, //for iOS 14.5
        },
        (result) => {
          setAppflyerSDK(JSON.stringify(result, null, 2));
          const userId = user.id.toString();
          appsFlyer.setCustomerUserId(userId, (res) => {
            setAppflyerUserId(JSON.stringify(res, null, 2));
          });
          onDeepLinkCanceller;
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }, [user?.id]); */

  // sending events to Javascript: https://reactnative.dev/docs/native-modules-android#sending-events-to-javascript
  const eventEmitter = new NativeEventEmitter(
    NativeModules.NotificationServiceExtensionModule
  );
  this.eventListener = eventEmitter.addListener(
    "NotificationEvent",
    (event) => {
      console.log(
        "NotificationEvent listener js: ",
        JSON.stringify(event.eventProperty, null, 2)
      );
    }
  );
  // manage notifications
  useEffect(() => {
    if (user) {
      OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);
      OneSignal.login(user.id?.toString());
      OneSignal.User.addTags({
        company_id: user.company_id?.toString(),
        user_id: user.id?.toString(),
      });
      setOnesignalInitialized(true);

      // clicked notification
      OneSignal.Notifications.addEventListener("click", (event) => {
        try {
          let updateData = event?.notification?.additionalData?.update
            ? event.notification.additionalData.update
            : null;
          console.log(
            "clicked notification: ",
            JSON.stringify(event.notification, null, 2)
          );
          if (updateData) setNotificationData((prev) => prev + 1);
        } catch (error) {
          console.error(error);
        }
      });
      // silent notifications
      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        (event) => {
          event.preventDefault();
          console.log(
            "silent notification: ",
            JSON.stringify(event.notification, null, 2)
          );
          let updateData = event?.notification?.additionalData?.update
            ? event.notification.additionalData.update
            : null;
          if (updateData) setNotificationData((prev) => prev + 1);
          //event.getNotification().display();
        }
      );
    }
  }, [user?.id, user?.company_id]);

  const manageInitData = async (data) => {
    if (data.plan) setPlan(data.plan);
    if (data.user) setUser(data.user);
    if (data.evac_lists) setEvacLists(data.evac_lists);
    if (data?.evacuation) setEvacuation(data.evacuation);
    if (data?.evac_points) setMarkers(data.evac_points);
    if (data?.local_contacts) setLocalContacts(data.local_contacts);
    if (data?.company_users) setCompanyUsers(data.company_users);
    if (data?.temp_contacts) setTempContacts(data.temp_contacts);
    if (data?.selected_users) setSelectedUsers(data.selected_users);
    if (data?.selected_users_drill)
      setSelectedUsersDrill(data.selected_users_drill);
    if (data?.selected_users_checkins)
      setSelectedUsersCheckins(data.selected_users_checkins);
    if (data.settings) setSettings(data.settings);
    if (data.settings?.lang) setLanguage(data.settings.lang);
    if (data?.invites) setPendingInvites(data.invites);
  };
  // init data from API
  useEffect(() => {
    const initData = async () => {
      if (user && user?.token?.auth) {
        const abortController = new AbortController();
        const result = await getInitApi.init(user.token.auth, {
          signal: abortController.signal,
        });
        console.log("init: ", JSON.stringify(result.data, null, 2));
        if (result.ok) {
          //setInit(result.data);
          manageInitData(result.data);
        }
        if (!result.ok && result.data.error_code === "err_token_1") {
          setUser(null);
          setLogout((prev) => !prev);
          await storage.removeToken();
          await storage.removeUser();
          console.log("auth token expired");
        }
        if (!result.ok) {
          console.log("get init error");
        }
        if (!initCalled) setInitCalled(true);

        return () => {
          abortController.abort();
        };
      }
    };
    initData();
  }, [user?.token?.auth, notificationData, affiliationId]);
  //get and set lang locale
  useEffect(() => {
    if (!languageLocale) {
      const userLocale = getLocales();
      if (userLocale) setLanguageLocale(userLocale[0]?.languageCode);
    }
  }, []);
  //change lang based on settings
  useEffect(() => {
    (async () => {
      try {
        const currentLang = settings?.lang;
        if (currentLang) {
          await i18n.changeLanguage(currentLang);
        }
        if (
          !currentLang &&
          languageLocale &&
          globals.AVAILABLE_LANGUAGES.includes(languageLocale)
        ) {
          //console.log("Setting language to locale language:", languageLocale);
          await i18n.changeLanguage(languageLocale);
        }
      } catch (error) {
        console.log("Error changing language:", error);
      } finally {
        //setLoading(false);
        setStorageCheckedForLang(true);
      }
    })();
  }, [settings?.lang, languageLocale]);

  const restoreSettings = async () => {
    const userFromStorage = await storage.getUser();
    if (!userFromStorage) {
      setLoading(false);
      return;
    }
    setUser(userFromStorage);
  };
  // restore settings
  useEffect(() => {
    restoreSettings();
  }, []);

  // check init, user and lang before stopping loading
  useEffect(() => {
    //console.log("check loading: ", user, storageCheckedForLang, initCalled);
    if (user && storageCheckedForLang && initCalled) setLoading(false);
  }, [user, storageCheckedForLang, initCalled]);

  // check if auth token is expired
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = await storage.getToken();
      const expirationString = token?.auth_expiration;

      if (expirationString) {
        // Convert "11.10.2025 13:32:39" to a valid Date object
        const [datePart, timePart] = expirationString.split(" ");
        const [day, month, year] = datePart.split(".");
        const expirationDate = new Date(`${year}-${month}-${day}T${timePart}`);
        const now = new Date();
        if (expirationDate < now) {
          setUser(null);
          setLogout((prev) => !prev);
          await storage.removeToken();
          await storage.removeUser();
          console.log("auth token expired");
          /* Toast.show(t("session expired"), {
            duration: Toast.durations.LONG,
          }); */
        }
      }
    };

    checkTokenExpiration();
  }, [user?.token]);

  return (
    <>
      <RootSiblingParent>
        {loading && (
          <ActivityIndicator
            style={styles.loading}
            animating={loading}
            size="large"
            color={colors.brightGreen}
          />
        )}
        {!loading && (
          <PaperProvider theme={theme}>
            <AuthContext.Provider
              value={{
                user,
                setUser,
                mapRegion,
                setMapRegion,
                markers,
                setMarkers,
                selectedUsers,
                setSelectedUsers,
                selectedUsersDrill,
                setSelectedUsersDrill,
                selectedUsersCheckins,
                setSelectedUsersCheckins,
                companyUsers,
                setCompanyUsers,
                logout,
                setLogout,
                mapFollowUser,
                setMapFollowUser,
                plan,
                setPlan,
                localContacts,
                setLocalContacts,
                contactAdded,
                setContactAdded,
                profile,
                setProfile,
                settings,
                setSettings,
                OSDeviceState,
                setOSDeviceState,
                extUserResponse,
                setExtUserResponse,
                OSevent,
                setOSevent,
                notificationData,
                setNotificationData,
                emailResponse,
                setEmailResponse,
                pendingInvites,
                setPendingInvites,
                invitesHistory,
                setInvitesHistory,
                eventsHistory,
                setEventsHistory,
                language,
                setLanguage,
                revenueCatInitialized,
                setRevenueCatInitialized,
                onesignalInitialized,
                setOnesignalInitialized,
                languageLocale,
                setLanguageLocale,
                storeDeepLink,
                setStoreDeepLink,
                appflyerSDK,
                setAppflyerSDK,
                appflyerUserId,
                setAppflyerUserId,
                affiliationId,
                setAffiliationId,
                markersWithDistance,
                setMarkersWithDistance,
                notificationPermissions,
                setNotificationPermissions,
                tempContacts,
                setTempContacts,
                evacuation,
                setEvacuation,
                isCollapsedShortcuts,
                setIsCollapsedShortcuts,
                evacLists,
                setEvacLists,
              }}
            >
              <SafeAreaProvider>
                <NavigationContainer>
                  {user ? <OptionNavigator /> : <AuthNavigator />}
                </NavigationContainer>
              </SafeAreaProvider>
            </AuthContext.Provider>
          </PaperProvider>
        )}
      </RootSiblingParent>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
});
