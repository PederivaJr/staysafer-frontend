import { useEffect, useContext } from "react";
import { LogLevel, OneSignal } from "react-native-onesignal";
import { AuthContext } from "../context/AuthContext";
import Constants from "expo-constants";

const useNotificationManager = () => {
  const { user, setNotificationData, setOnesignalInitialized } =
    useContext(AuthContext);

  useEffect(() => {
    if (!user?.id || !user?.company_id) return;

    let isMounted = true;

    try {
      // Initialize OneSignal with your App ID
      OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);
      // Log in user to OneSignal
      OneSignal.login(user.id.toString());
      // Add custom tags for segmentation
      OneSignal.User.addTags({
        company_id: user.company_id.toString(),
        user_id: user.id.toString(),
      });
      // Confirm initialization
      if (isMounted) setOnesignalInitialized(true);
    } catch (err) {
      console.error("[OneSignal] Initialization error:", err);
    }

    // Notification click handler
    const onNotificationClick = (event) => {
      try {
        const update = event?.notification?.additionalData?.update;
        if (update && isMounted) {
          setNotificationData((prev) => prev + 1);
        }
      } catch (err) {
        console.error("[OneSignal] Click event handler error:", err);
      }
    };

    // Foreground notification handler (silent push)
    const onForegroundNotification = (event) => {
      try {
        // Prevent default if supported
        event?.preventDefault?.();

        const update = event?.notification?.additionalData?.update;
        if (update && isMounted) {
          setNotificationData((prev) => prev + 1);
        }
      } catch (err) {
        console.error("[OneSignal] Foreground event handler error:", err);
      }
    };

    // Add listeners
    try {
      OneSignal.Notifications.addEventListener("click", onNotificationClick);
      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        onForegroundNotification
      );
    } catch (err) {
      console.error("[OneSignal] Failed to add event listeners:", err);
    }

    return () => {
      isMounted = false;
      try {
        OneSignal.Notifications.removeEventListener(
          "click",
          onNotificationClick
        );
        OneSignal.Notifications.removeEventListener(
          "foregroundWillDisplay",
          onForegroundNotification
        );
      } catch (err) {
        console.error("[OneSignal] Failed to remove event listeners:", err);
      }
    };
  }, [user, setNotificationData, setOnesignalInitialized]);

  return null;
};

export default useNotificationManager;
