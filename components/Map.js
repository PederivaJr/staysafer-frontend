import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { getPreciseDistance } from "geolib";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-root-toast";
import colors from "../config/color";
import MapStatus from "./MapStatus";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import createCheckinApi from "../api/createCheckin";
import ProminentDisclosureLocation from "./ProminentDisclosureLocation";
import MapMarker from "./MapMarker";
import useLocationPermission from "../hooks/useLocationPermission";
import useEvacPoints from "../hooks/useEvacPoints";
import getEvacPointsApi from "../api/getEvacPoints";
import MapCallout from "./MapCallout";
import { useIsFocused } from "@react-navigation/native";

const Map = ({ onPress, showDistanceStatus }) => {
  const authContext = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [distance, setDistance] = useState(null);
  const [trackViewChanges, setTrackViewChanges] = useState(true);
  const [isSafeGPS, setIsSafeGPS] = useState(null);
  const [closestEvacPointId, setClosestEvacPointId] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const {
    hasLocationPermissions,
    disclosureModalVisible,
    handleAgree,
    handleSkip,
  } = useLocationPermission();

  // ✅ NEW: Real-time hooks that replace useInitData functionality
  useEvacPoints(); // Updates evacuation points in real-time

  // Use the real-time evacuation points hook
  const {
    evacPoints: realtimeEvacPoints = [],
    loading: evacPointsLoading = false,
    error: evacPointsError = null,
    lastUpdate = null,
  } = useEvacPoints() || {};

  let locationWatcher = null;
  const { width, height } = Dimensions.get("window");

  // Always load initial data from MySQL API when screen is focused
  useEffect(() => {
    if (isFocused) {
      console.log(
        "Map focused, loading evacuation points from MySQL API (source of truth)"
      );
      refreshEvacPoints();
    }
  }, [isFocused]);

  // Apply real-time updates to the MySQL data
  useEffect(() => {
    if (lastUpdate && authContext.markers?.length >= 0) {
      if (lastUpdate.action === "evac_point_created") {
        console.log("Applying real-time evacuation point creation to map");
        // For new points, refresh the complete list to get the new point
        refreshEvacPoints();
      } else if (lastUpdate.action === "evac_point_deleted") {
        console.log("Applying real-time evacuation point deletion to map");
        // For deletions, refresh the complete list to reflect the removal
        refreshEvacPoints();
      } else if (lastUpdate.action === "evac_point_updated") {
        console.log("Applying real-time evacuation point update to map");
        // For updates, refresh the complete list to reflect changes
        refreshEvacPoints();
      }
    }
  }, [lastUpdate]);

  // Update context with real-time data when available
  useEffect(() => {
    if (realtimeEvacPoints && realtimeEvacPoints.length >= 0) {
      console.log("Map: Updating evacuation points from real-time data");
      authContext.setMarkers(realtimeEvacPoints);
    }
  }, [realtimeEvacPoints]);

  // Log real-time updates for debugging
  useEffect(() => {
    if (lastUpdate) {
      console.log("Map: Update received:", {
        action: lastUpdate.action,
        evacPointId: lastUpdate.evacPointId,
        evacPointName: lastUpdate.evacPointName,
        createdEvacPointName: lastUpdate.createdEvacPointName,
        deletedEvacPointName: lastUpdate.deletedEvacPointName,
        updatedBy: lastUpdate.updatedBy,
      });
    }
  }, [lastUpdate]);

  // Manual refresh function (as backup and for initial load)
  const refreshEvacPoints = async () => {
    try {
      const result = await getEvacPointsApi.getEvacPoints();
      console.log(
        "Manual refresh evacuation points:",
        JSON.stringify(result, null, 2)
      );

      if (result.ok && result.data?.evac_points) {
        authContext.setMarkers(result.data.evac_points);
      }
    } catch (error) {
      console.error("Manual refresh evacuation points failed:", error);
    }
  };

  // check if user is already safe with GPS
  useEffect(() => {
    const isAlreadySafeGPS = authContext.selectedUsersCheckins?.some(
      (contact) =>
        contact?.user_id === authContext.user?.id &&
        contact?.checkins?.gps?.active
    );
    setIsSafeGPS(isAlreadySafeGPS);
  }, [authContext.selectedUsersCheckins]);

  // check closest evac point
  useEffect(() => {
    const closestMarkerId = authContext.markersWithDistance.find(
      (m) => m.active
    )?.evac_point_id;

    if (closestMarkerId && closestMarkerId !== closestEvacPointId) {
      setClosestEvacPointId(closestMarkerId);
    }
  }, [authContext.markersWithDistance]);

  // watch user position
  useEffect(() => {
    if (hasLocationPermissions) {
      (async () => {
        locationWatcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (updatedLocation) => {
            setLocation(updatedLocation);
          }
        );
      })();
    }
    return () => {
      if (locationWatcher) locationWatcher.remove();
    };
  }, [hasLocationPermissions]);

  // check if user has reached evac point
  useEffect(() => {
    if (location) {
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: region ? region.latitudeDelta : 0.007,
        longitudeDelta: region ? region.longitudeDelta : 0.007,
      };

      if (JSON.stringify(newRegion) !== JSON.stringify(region)) {
        setRegion(newRegion);
        authContext.setMapRegion(newRegion);
      }

      if (authContext.markers?.length > 0) {
        const updatedMarkersWithDistance = authContext.markers
          .filter((marker) => marker.active)
          .map((item) => {
            const distance = getPreciseDistance(currentCoords, item.coordinate);
            return {
              title: item.title,
              radius: item.radius,
              distance,
              active: item.active,
              evac_point_id: item.evac_point_id,
            };
          });

        updatedMarkersWithDistance.sort((a, b) => a.distance - b.distance);

        if (
          !authContext.markersWithDistance?.length ||
          updatedMarkersWithDistance[0]?.evac_point_id !==
            authContext.markersWithDistance[0]?.evac_point_id
        ) {
          authContext.setMarkersWithDistance(updatedMarkersWithDistance);
        }

        if (
          (authContext.evacuation?.real_event ||
            authContext.evacuation?.drill) &&
          isSafeGPS === false
        ) {
          updatedMarkersWithDistance?.forEach(async (item) => {
            if (item.distance <= item.radius) {
              const alreadyGpsSafe = authContext.selectedUsersCheckins?.some(
                (contact) =>
                  contact.user_id === authContext.user.id &&
                  contact.checkins?.gps?.active
              );
              const alreadyInSelectedUsers = authContext.selectedUsers?.some(
                (selectedUser) => selectedUser.user_id === authContext.user.id
              );

              if (
                isSafeGPS === false &&
                alreadyInSelectedUsers &&
                authContext.settings?.gps_active &&
                authContext.setMarkersWithDistance?.length > 0
              ) {
                // get evac list based on event type (alarm, drill)
                const abortController = new AbortController();
                const contact = {
                  checkin_type: "gps",
                  checkin_date: new Date(),
                  evac_point_id:
                    authContext.markersWithDistance[0]?.evac_point_id || null,
                  user_id: authContext.user.id,
                  list_id: authContext.evacuation.list_id,
                };
                const result = await createCheckinApi.createCheckin(contact, {
                  signal: abortController.signal,
                });
                console.log(
                  "gps checkin API: ",
                  JSON.stringify(result, null, 2)
                );
                if (result.ok && result.data?.selected_users_checkins) {
                  authContext.setSelectedUsersCheckins(
                    result.data.selected_users_checkins
                  );
                  Toast.show(
                    t("toast evac point reached") + ": " + item.title,
                    { duration: Toast.durations.SHORT }
                  );
                  if (locationWatcher) locationWatcher.remove();
                }

                return () => abortController.abort();
              }
            }
          });
        }
        setDistance(distance);
      }
    }
  }, [location, authContext.markers]);

  const saveRegion = async (region) => {
    authContext.setMapRegion(region);
  };

  const handleMarkerPress = (marker) => {
    console.log("pressed marker: ", JSON.stringify(marker, null, 2));
    setSelectedMarker(marker);
    mapRef.current?.animateToRegion(
      {
        ...marker.coordinate,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005 * (width / height),
      },
      500
    );
  };

  // Show error message if there's a critical Firestore error
  if (evacPointsError) {
    return (
      <View style={styles.content}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{evacPointsError}</Text>
          <Text style={styles.retryText} onPress={refreshEvacPoints}>
            {t("tap to retry")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      {!location && (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator
            animating={
              !location ||
              (evacPointsLoading && authContext.markers?.length === 0)
            }
            size="large"
            color={colors.brightGreen}
          />
          {evacPointsLoading && authContext.markers?.length === 0 && (
            <Text style={styles.loadingText}>
              {t("loading evacuation points...")}
            </Text>
          )}
        </View>
      )}
      <ProminentDisclosureLocation
        visible={disclosureModalVisible}
        onAgree={handleAgree}
        onSkip={handleSkip}
        onClose={() => setDisclosureModalVisible(false)}
      />
      {location &&
        region &&
        hasLocationPermissions &&
        Object.keys(authContext.mapRegion)?.length > 0 && (
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapRef}
            style={styles.map}
            mapType="satellite"
            paddingAdjustmentBehavior="never"
            followsUserLocation={true}
            showsBuildings={true}
            showsIndoors={true}
            showsIndoorLevelPicker={true}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            toolbarEnabled={true}
            zoomEnabled={true}
            rotateEnabled={true}
            region={region}
            onRegionChangeComplete={saveRegion}
            onPress={onPress}
          >
            {authContext.markers?.length > 0 &&
              authContext.markers
                ?.filter((marker) => marker.active === true)
                .map((marker) => (
                  <MapMarker
                    key={marker.key}
                    marker={marker}
                    closestEvacPointId={closestEvacPointId}
                    title={marker.title}
                    description={
                      marker.evac_point_id === closestEvacPointId
                        ? t("manage map evac point description closest")
                        : t("manage map evac point description")
                    }
                    strokeColor={
                      marker.evac_point_id === closestEvacPointId
                        ? colors.yellow
                        : colors.lightYellow
                    }
                    onPress={() => handleMarkerPress(marker)}
                  />
                ))}
          </MapView>
        )}
      {selectedMarker && (
        <MapCallout
          marker={selectedMarker}
          description={
            selectedMarker.evac_point_id === closestEvacPointId
              ? t("manage map evac point description closest")
              : t("manage map evac point description")
          }
          onClose={() => {
            setSelectedMarker(null);
          }}
        />
      )}
      {authContext.markers?.length === 0 && (
        <View style={styles.noMarkerSet}>
          {isSafeGPS === false && (
            <Text style={styles.distanceText}>{t("no evac point set")}</Text>
          )}
        </View>
      )}
      {showDistanceStatus && authContext.markers?.length > 0 && (
        <MapStatus
          distance={distance}
          closestMarker={authContext.markersWithDistance[0]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexGrow: 1,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.grey,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  retryText: {
    color: colors.primary,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  map: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    height: "auto",
    width: "100%",
  },
  distanceText: {
    textAlign: "center",
    paddingVertical: 4,
  },
  noMarkerSet: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
});

export default Map;
