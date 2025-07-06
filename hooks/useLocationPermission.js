import { useState, useEffect } from "react";
import * as Location from "expo-location";

const useLocationPermission = () => {
  const [hasLocationPermissions, setHasLocationPermissions] = useState(false);
  const [disclosureModalVisible, setDisclosureModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { granted, canAskAgain } =
        await Location.getForegroundPermissionsAsync();
      if (!granted && canAskAgain) {
        setDisclosureModalVisible(true);
      } else {
        setHasLocationPermissions(true);
      }
    })();
  }, []);

  const handleAgree = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setHasLocationPermissions(status === "granted");
    setDisclosureModalVisible(false);
  };

  const handleSkip = () => {
    setHasLocationPermissions(false);
    setDisclosureModalVisible(false);
  };

  return {
    hasLocationPermissions,
    disclosureModalVisible,
    handleAgree,
    handleSkip,
  };
};

export default useLocationPermission;
