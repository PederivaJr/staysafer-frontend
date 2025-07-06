import { useContext, useEffect } from "react";
import { LogLevel, OneSignal } from "react-native-onesignal";
import Constants from "expo-constants";
import { AuthContext } from "../context/AuthContext";

const useInitOneSignal = () => {
  const authContext = useContext(AuthContext);

  const initializeOneSignal = async () => {
    if (authContext.user) {
      OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);
      OneSignal.login(authContext.user.id?.toString());
      OneSignal.User.addTags({
        company_id: authContext.user.company_id?.toString(),
        user_id: authContext.user.id?.toString(),
      });
      authContext.setOnesignalInitialized(true);

      // clicked notification
      OneSignal.Notifications.addEventListener("click", (event) => {
        try {
          let updateData = event?.notification?.additionalData?.update
            ? event.notification.additionalData.update
            : null;
          if (updateData) authContext.setNotificationData(updateData);
          /* console.log(
          "onesignal notification clicked: ",
          JSON.stringify(event.notification, null, 2)
        ); */
        } catch (error) {
          console.error(error);
        }
      });
      // silent notifications
      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        (event) => {
          event.preventDefault();
          let updateData = event?.notification?.additionalData?.update
            ? event.notification.additionalData.update
            : null;
          /* console.log(
          "onesignal notification silent: ",
          JSON.stringify(event.notification, null, 2)
        ); */
          if (updateData) authContext.setNotificationData(updateData);
          //event.getNotification().display();
        }
      );
    }
  };

  return { initializeOneSignal };
};

export default useInitOneSignal;
