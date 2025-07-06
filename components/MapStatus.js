import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";

function MapStatus({ distance, closestMarker }) {
  const [isSafe, setIsSafe] = useState(null);
  const authContext = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  console.log(
    "distance markers: ",
    JSON.stringify(
      authContext.markersWithDistance.find((marker) => marker.active),
      null,
      2
    )
  );

  useEffect(() => {
    let alreadySafe = authContext.selectedUsersCheckins?.some((contact) => {
      return (
        contact?.user_id == authContext.user?.id &&
        (contact?.checkins?.manual?.active ||
          contact?.checkins?.gps?.active ||
          contact?.checkins?.nfc?.active)
      );
    });
    setIsSafe(alreadySafe);
  }, [authContext.selectedUsersCheckins]);

  return (
    <View style={styles.distanceStatus}>
      {/* <View style={styles.distanceContainer}> 
          {!isSafeGPS && <Text style={styles.distanceText}>{t('map status distance')}: {distance}m</Text>}
        </View> */}
      <View style={styles.evacReachedContainer}>
        <Text>
          {t("map status closest marker")}:{" "}
          {authContext.markersWithDistance?.find((marker) => marker.active)
            ?.title
            ? authContext.markersWithDistance.find(
                (marker) => marker.active === true
              ).title
            : ""}
        </Text>
      </View>
      <View style={styles.evacReachedContainer}>
        <Text>
          {t("map status evac point reached")}: {isSafe ? t("yes") : t("no")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  distanceStatus: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 8,
  },
  distanceContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 0,
  },
  checkboxContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 0,
  },
  evacReachedContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 0,
  },
  checkboxText: {
    flex: 0,
    paddingRight: 4,
  },
});

export default MapStatus;
