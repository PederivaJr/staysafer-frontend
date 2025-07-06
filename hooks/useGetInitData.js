import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import getInitFromNotification from "../api/getInitFromNotification";
import { setInit } from "./useSetInit";
import useLogout from "./useLogout";

const useGetInitData = () => {
  const authContext = useContext(AuthContext);

  const getInitData = async (data) => {
    // Making the API call and handling the response.
    const result = await getInitFromNotification.getInitFromNotification(data);
    console.log("init from notification API: ", result);
    if (result.ok) {
      if (result.data) setInit(data);
    }
  };
  return { getInitData };
};

export default useGetInitData;
