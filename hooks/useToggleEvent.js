import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Toast from "react-native-root-toast";
import useStartEvent from "./useStartEvent";
import useEndEvent from "./useEndEvent";

const useToggleEvent = () => {
  const { startEvent } = useStartEvent();
  const { endEvent } = useEndEvent();
  const authContext = useContext(AuthContext);
  const { t } = useTranslation();

  const toggleEvent = async (eventType) => {
    const settings = authContext.settings;
    const markers = authContext.markers?.length;
    const users = authContext.selectedUsers?.length;

    if (
      (settings?.no_evac_no_markers && markers === 0) ||
      (settings?.no_evac_no_people && users === 0)
    ) {
      Toast.show(t("toast cannot start event"), {
        duration: Toast.durations.LONG,
      });
      return;
    }

    if (eventType === "start") {
      await startEvent(eventType);
    } else if (eventType === "end") {
      await endEvent();
    }
  };

  return toggleEvent;
};

export default useToggleEvent;
