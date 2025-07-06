import { useEffect, useState } from "react";
import appsFlyer from "react-native-appsflyer";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import createAffiliationApi from "../api/createAffiliation";

const useAppsFlyer = () => {
  const {
    user,
    setUser,
    appflyerSDK,
    setAppflyerSDK,
    setAppflyerUserId,
    setStoreDeepLink,
    affiliationId,
    setAffiliationId,
  } = useContext(AuthContext);

  const [loading, setLoading] = useState(true); // Local loading state

  useEffect(() => {
    const initializeAppsFlyer = () => {
      if (user?.id && !appflyerSDK) {
        appsFlyer.initSdk(
          {
            devKey: "VS9BLDHZSWsbYDPr3ZqVnm",
            isDebug: true,
            appId: "6469057429",
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 10,
          },
          (result) => {
            setAppflyerSDK(result);
            const userId = user.id.toString();
            appsFlyer.setCustomerUserId(userId, (res) => {
              setAppflyerUserId(res);
            });
            setLoading(false);
          },
          (error) => {
            console.error("AppsFlyer initialization error:", error);
            setLoading(false);
          }
        );
      }
    };

    if (user) {
      initializeAppsFlyer();
    }

    const onDeepLinkCanceller = appsFlyer.onDeepLink((res) => {
      if (res?.deepLinkStatus !== "NOT_FOUND") {
        setStoreDeepLink(JSON.stringify(res));
        const deepLinkValue = res?.data.deep_link_value;
        if (deepLinkValue) setAffiliationId(deepLinkValue);
      }
    });

    return () => {
      onDeepLinkCanceller(); // Cleanup listener
    };
  }, [user, affiliationId]);

  //set affiliation to backend
  useEffect(() => {
    const abortController = new AbortController();
    const sendData = async () => {
      try {
        const result = await createAffiliationApi.createAffiliation(
          affiliationId,
          { signal: abortController.signal }
        );
        if (result.ok && result.data?.user) {
          setUser(result.data.user);
        }
      } catch (error) {
        console.log(error);
      } finally {
        abortController.abort();
      }
    };
    if (affiliationId) sendData();

    return () => {
      abortController.abort();
    };
  }, [affiliationId]);

  return loading; // Hook still exposes a loading state for optional use
};

export default useAppsFlyer;
