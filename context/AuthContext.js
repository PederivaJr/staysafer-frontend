import React, { createContext, useState, useEffect } from "react";
import AuthManager from "../auth/AuthManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersDrill, setSelectedUsersDrill] = useState([]);
  const [selectedUsersCheckins, setSelectedUsersCheckins] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [logout, setLogout] = useState(false);
  const [mapFollowUser, setMapFollowUser] = useState(false);
  const [plan, setPlan] = useState(null);
  const [localContacts, setLocalContacts] = useState([]);
  const [contactAdded, setContactAdded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [OSDeviceState, setOSDeviceState] = useState(null);
  const [extUserResponse, setExtUserResponse] = useState(null);
  const [OSevent, setOSevent] = useState(null);
  const [notificationData, setNotificationData] = useState(null);
  const [emailResponse, setEmailResponse] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesHistory, setInvitesHistory] = useState([]);
  const [eventsHistory, setEventsHistory] = useState([]);
  const [language, setLanguage] = useState("en");
  const [revenueCatInitialized, setRevenueCatInitialized] = useState(false);
  const [onesignalInitialized, setOnesignalInitialized] = useState(false);
  const [languageLocale, setLanguageLocale] = useState(null);
  const [storeDeepLink, setStoreDeepLink] = useState(null);
  const [appflyerSDK, setAppflyerSDK] = useState(null);
  const [appflyerUserId, setAppflyerUserId] = useState(null);
  const [affiliationId, setAffiliationId] = useState(null);
  const [markersWithDistance, setMarkersWithDistance] = useState([]);
  const [notificationPermissions, setNotificationPermissions] = useState(null);
  const [tempContacts, setTempContacts] = useState([]);
  const [evacuation, setEvacuation] = useState(false);
  const [isCollapsedShortcuts, setIsCollapsedShortcuts] = useState(false);
  const [evacLists, setEvacLists] = useState(null);
  const [authTokenChecked, setAuthTokenChecked] = useState(false);
  const [initCalled, setInitCalled] = useState(false);
  const [storageCheckedForLang, setStorageCheckedForLang] = useState(false);

  // Register context setters once, to use in the api client controller
  useEffect(() => {
    AuthManager.setLogoutHandlers({
      setUser,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        appLoading,
        setAppLoading,
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
        authTokenChecked,
        setAuthTokenChecked,
        initCalled,
        setInitCalled,
        storageCheckedForLang,
        setStorageCheckedForLang,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
