import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const useSetInit = () => {
  const authContext = useContext(AuthContext);

  const setInit = (data) => {
    if (data.plan) authContext.setPlan(data.plan);
    if (data.user) authContext.setUser(data.user);
    if (data?.evacuation) authContext.setEvacuation(data.evacuation);
    if (data?.evac_points) authContext.setMarkers(data.evac_points);
    if (data?.local_contacts) authContext.setLocalContacts(data.local_contacts);
    if (data?.company_users) authContext.setCompanyUsers(data.company_users);
    //if (data?.selected_users) authContext.setSelectedUsers(data.selected_users);
    if (data?.temp_contacts) authContext.setTempContacts(data.temp_contacts);
    if (data?.selected_users_checkins)
      authContext.setSelectedUsersCheckins(data.selected_users_checkins);
    if (data.settings) authContext.setSettings(data.settings);
    if (data.settings?.lang) authContext.setLanguage(data.settings.lang);
    if (data?.invites) authContext.setPendingInvites(data.invites);
  };
  return { setInit };
};

export default useSetInit;
