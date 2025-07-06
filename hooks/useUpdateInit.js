import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import getInitApi from "../api/getInit";
import storage from "../auth/storage";

const useUpdateInit = () => {
  const authContext = useContext(AuthContext);

  const manageInitData = async (data) => {
    if (data.plan) authContext.setPlan(data.plan);
    if (data.user) authContext.setUser(data.user);
    if (data.evac_lists) authContext.setEvacLists(data.evac_lists);
    if (data?.evacuation) authContext.setEvacuation(data.evacuation);
    if (data?.evac_points) authContext.setMarkers(data.evac_points);
    if (data?.local_contacts) authContext.setLocalContacts(data.local_contacts);
    if (data?.company_users) authContext.setCompanyUsers(data.company_users);
    if (data?.temp_contacts) authContext.setTempContacts(data.temp_contacts);
    if (data?.selected_users) authContext.setSelectedUsers(data.selected_users);
    if (data?.selected_users_drill)
      authContext.setSelectedUsersDrill(data.selected_users_drill);
    if (data?.selected_users_checkins)
      authContext.setSelectedUsersCheckins(data.selected_users_checkins);
    if (data.settings) authContext.setSettings(data.settings);
    if (data.settings?.lang) authContext.setLanguage(data.settings.lang);
    if (data?.invites) authContext.setPendingInvites(data.invites);
  };
  // fetch init data
  useEffect(() => {
    const fetchInitData = async () => {
      const token = await storage.getToken();
      if (!token?.auth) {
        authContext.setInitCalled(true);
        return;
      }

      if (authContext.user) {
        const controller = new AbortController();
        const result = await getInitApi.init(false, {
          signal: controller.signal,
        });
        //console.log("update init API: ", JSON.stringify(result, null, 2));

        if (result.ok) {
          manageInitData(result.data);
        }
      }
    };

    fetchInitData();
  }, [authContext.notificationData, authContext.affiliationId]);
};

export default useUpdateInit;
