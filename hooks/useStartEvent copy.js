import { useContext } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import createEvacuationApi from "../api/createEvacuation";
import Toast from "react-native-root-toast";
import useLogout from "./useLogout";

const useStartEvent = () => {
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  const startEvent = async (eventType) => {
    // get evac list based on event type
    let list = null;
    if (eventType === "drill")
      list = authContext.evacLists?.find(
        (list) => list.name === "default drill"
      );
    if (eventType === "real_event")
      list = authContext.evacLists?.find(
        (list) => list.name === "default alarm"
      );

    if (eventType === "real_event" && authContext.evacuation?.drill) {
      // block start alarm if drill is active
      Toast.show(t("toast no alarm during drill"), {
        duration: Toast.durations.LONG,
      });
      return;
    }
    if (eventType === "drill" && authContext.evacuation?.real_event) {
      // block start alarm if drill is active
      Toast.show(t("toast no drill during alarm"), {
        duration: Toast.durations.LONG,
      });
      return;
    }
    const alertTitle =
      eventType === "drill"
        ? t("alert start drill alarm")
        : t("alert start alarm");
    // manage start message
    let startMessage = t("alert start alarm message");
    if (eventType === "real_event") {
      if (
        authContext.markers?.length == 0 &&
        authContext.selectedUsers?.length == 0
      )
        startMessage = t("alert start alarm no markers no people message");
      if (authContext.markers?.length == 0)
        startMessage = t("alert start alarm no markers message");
      if (authContext.selectedUsers?.length == 0)
        startMessage = t("alert start alarm no people message");
    }
    if (eventType === "drill") {
      startMessage = t("alert start drill alarm message");
      if (
        authContext.markers?.length == 0 &&
        authContext.selectedUsersDrill?.length == 0
      )
        startMessage = t(
          "alert start drill alarm no markers no people message"
        );
      if (authContext.markers?.length == 0)
        startMessage = t("alert start drill alarm no markers message");
      if (authContext.selectedUsersDrill?.length == 0)
        startMessage = t("alert start drill alarm no people message");
    }

    Alert.alert(alertTitle, startMessage, [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("ok"),
        onPress: async () => {
          if (
            (authContext.settings?.no_evac_no_markers &&
              authContext.markers?.length == 0) ||
            (authContext.settings?.no_evac_no_people &&
              authContext.selectedUsers?.length == 0)
          ) {
            Toast.show(t("toast cannot start event"), {
              duration: Toast.durations.LONG,
            });
            return;
          }
          const result = await createEvacuationApi.createEvacuation(
            eventType,
            list.list_id
          );
          console.log(
            `start ${eventType} shortcut API: `,
            JSON.stringify(result, null, 2)
          );
          if (result.ok) {
            if (result.data?.evacuation)
              authContext.setEvacuation(result.data.evacuation);
            if (result.data?.selected_users)
              authContext.setSelectedUsers(result.data.selected_users);
            if (result.data?.selected_users_checkins)
              authContext.setSelectedUsersCheckins(
                result.data.selected_users_checkins
              );
            if (result.data?.evac_points)
              authContext.setMarkers(result.data.evac_points);
          }
        },
      },
    ]);
  };

  return { startEvent };
};

export default useStartEvent;
