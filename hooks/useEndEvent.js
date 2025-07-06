import { useContext } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import updateEvacuationApi from "../api/updateEvacuation";
import Toast from "react-native-root-toast";

const useEndEvent = () => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  let list = null;
  if (authContext.evacuation?.drill)
    list = authContext.evacLists?.find((list) => list.name === "default drill");
  if (authContext.evacuation?.real_event)
    list = authContext.evacLists?.find((list) => list.name === "default alarm");

  const endEvent = async (eventType) => {
    const isRealEvent = eventType === "real_event";
    const alertTitle = isRealEvent
      ? t("alert end alarm")
      : t("alert end drill alarm");
    let alertMessage = isRealEvent
      ? t("alert end alarm message")
      : t("alert end drill alarm message");
    let missingContactsArray = [];

    // Determine missing contacts
    if (
      authContext.settings?.confirmed_save === false ||
      !authContext.settings?.confirmed_save
    ) {
      missingContactsArray = authContext.selectedUsersCheckins?.filter(
        (contact) => {
          if (!contact.checkins) return false;
          const activeCheckins = Object.values(contact.checkins).filter(
            (checkin) => checkin.active
          );
          return !contact.checkins.absent.active && activeCheckins?.length == 0;
        }
      );
    }
    if (authContext.settings?.confirmed_save === true) {
      missingContactsArray = authContext.selectedUsersCheckins?.filter(
        (contact) => {
          if (!contact.checkins) return false;
          const activeCheckins = Object.values(contact.checkins).filter(
            (checkin) => checkin.active
          );
          if (contact.user_id)
            return (
              !contact.checkins.absent.active && activeCheckins?.length < 2
            );
          if (!contact.user_id)
            return (
              !contact.checkins.absent.active && activeCheckins?.length == 0
            );
        }
      );
    }

    if (missingContactsArray?.length > 0) {
      alertMessage = isRealEvent
        ? t("alert end alarm with missing message")
        : t("alert end drill alarm with missing message");
    }

    Alert.alert(alertTitle, alertMessage, [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("ok"),
        onPress: async () => {
          try {
            const result = await updateEvacuationApi.updateEvacuation(
              authContext.evacuation.evacuation_id,
              authContext.evacuation.list_id
            );

            console.log(
              `${isRealEvent ? "end alarm" : "end drill"} API: `,
              JSON.stringify(result, null, 2)
            );

            if (result.ok) {
              // Clear local checkins data immediately
              authContext.setSelectedUsersCheckins([]);

              // Note: evacuation state will be cleared by useEvacuationStatus hook
              // when it detects the evacuation is no longer active
              console.log("Evacuation ended, real-time update will follow");

              Toast.show(
                isRealEvent
                  ? t("toast evacuation ended")
                  : t("toast drill ended"),
                { duration: Toast.durations.SHORT }
              );
            } else {
              Toast.show(t("toast error general"), {
                duration: Toast.durations.SHORT,
              });
            }
          } catch (error) {
            console.error("End event failed:", error);
            Toast.show(t("toast error general"), {
              duration: Toast.durations.SHORT,
            });
          }
        },
      },
    ]);
  };

  return { endEvent };
};

export default useEndEvent;
