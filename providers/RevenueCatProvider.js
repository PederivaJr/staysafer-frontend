import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  PurchasesOffering,
  presentPaywallIfNeeded,
  LOG_LEVEL,
} from "react-native-purchases";
import Constants from "expo-constants";

const RevenueCatContext = createContext(null);

const RevenueCatProvider = ({ children }) => {
  const [revenueCatUser, setRevenueCatUser] = useState({
    cookies: 0,
    items: [],
    pro: false,
  });
  const [packages, setPackages] = useState([]);
  const [isReady, setIsReady] = useState(false);

  /* useEffect(() => {
    const cleanup = () => {
      Purchases.removeCustomerInfoUpdateListener();
    };
  
    return cleanup;
  }, []); */

  useEffect(() => {
    const init = async () => {
      if (Platform.OS == "android") {
        await Purchases.configure({
          apiKey: Constants.expoConfig.extra.revenueCat.APIKeys.google,
        });
      } else {
        await Purchases.configure({
          apiKey: Constants.expoConfig.extra.revenueCat.APIKeys.apple,
        });
      }
      setIsReady(true);
      // Use more logging during debug if want!
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      // Listen for customer updates
      /* Purchases.addCustomerInfoUpdateListener(async (info) => {
        updateCustomerInformation(info);
      }); */
      // Load all offerings and the user object with entitlements
      await loadOfferings();
    };
    init();
  }, []);

  // Load all offerings a user can (currently) purchase
  const loadOfferings = async () => {
    const offerings = await Purchases.getOfferings();
    if (offerings?.current) {
      setPackages(offerings?.current?.availablePackages);
    }
  };

  // Update user state based on previous purchases
  /* const updateCustomerInformation = async (customerInfo) => {
    const newUser = { cookies: revenueCatUser?.cookies, items: [], pro: false };
    if (customerInfo?.entitlements?.active['collaborator_package:collaborator-sub-yearly'] !== undefined) {
      newUser.items.push(customerInfo?.entitlements.active['collaborator_package:collaborator-sub-yearly'].identifier);
    }
    if (customerInfo?.entitlements?.active['collaborator_package:collaborator-sub-monthly'] !== undefined) {
      newUser.items.push(customerInfo?.entitlements.active['collaborator_package:collaborator-sub-monthly'].identifier);
    }
    if (customerInfo?.entitlements?.active['PRO Features'] !== undefined) {
      newUser.pro = true;
    }
    setRevenueCatUser(newUser);
  }; */

  // Purchase a package
  /* const purchasePackage = async (pack) => {
    try {
      await Purchases.purchasePackage(pack);
      // Directly add our consumable product 
      if (pack?.product?.identifier === 'Collaborator package') {
        setRevenueCatUser({ ...revenueCatUser, cookies: (revenueCatUser.cookies += 5) });
      }
    } catch (e) {
      if (!e.userCancelled) {
        console.log(e);
      }
    }
  }; */
  // Restore previous purchases
  /* const restorePermissions = async () => {
    try {
      const customer = await Purchases.restorePurchases();
      console.log('Restored purchases:', customer);
      return customer;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error; // Rethrow the error to propagate it to the caller
    }
  }; */

  const value = {
    restorePermissions,
    revenueCatUser,
    packages,
    purchasePackage,
  };

  // Return empty fragment if provider is not ready (Purchase not yet initialized)
  /*  if (!isReady) return (
    <></>
  ); */

  if (isReady)
    return (
      <RevenueCatContext.Provider value={value}>
        {children}
      </RevenueCatContext.Provider>
    );
};

export default RevenueCatProvider;
