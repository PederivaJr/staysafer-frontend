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
import cache from "../utility/cache";
import colors from "../config/color";
import MapStatus from "./MapStatus";
import "../config/lang/i18n";
import { useTranslation } from "react-i18next";
import ProminentDisclosureLocation from "./ProminentDisclosureLocation";
import MapMarker from "./MapMarker";
import useLocationPermission from "../hooks/useLocationPermission";
import useEvacPoints from "../hooks/useEvacPoints";
import getEvacPointsApi from "../api/getEvacPoints";
import deleteEvacPointApi from "../api/deleteEvacPoints";
import updateMarkerApi from "../api/updateMarker";
import createEvacPointsApi from "../api/createEvacPoints";
import CustomCallout from "./CustomCallout";
import { v4 as uuidv4 } from "uuid";
import { useIsFocused } from "@react-navigation/native";

const MapManage = ({ markerName, radius, setMarkerName }) => {
  const authContext = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [distance, setDistance] = useState(null);
  const [closestEvacPointId, setClosestEvacPointId] = useState(null);
  const [trackViewChanges, setTrackViewChanges] = useState(true);
  const [isSafeGPS, setIsSafeGPS] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [calloutOpen, setCalloutOpen] = useState(false);
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

  const { width, height } = Dimensions.get("window");

  // Always load initial data from MySQL API when screen is focused
  useEffect(() => {
    if (isFocused) {
      console.log(
        "MapManage focused, loading evacuation points from MySQL API (source of truth)"
      );
      refreshEvacPoints();
    }
  }, [isFocused]);

  // Apply real-time updates to the MySQL data
  useEffect(() => {
    if (lastUpdate && authContext.markers?.length >= 0) {
      if (lastUpdate.action === "evac_point_created") {
        console.log("Applying real-time evacuation point creation");
        // For new points, refresh the complete list to get the new point
        refreshEvacPoints();
      } else if (lastUpdate.action === "evac_point_deleted") {
        console.log("Applying real-time evacuation point deletion");
        // For deletions, refresh the complete list to reflect the removal
        refreshEvacPoints();
      } else if (lastUpdate.action === "evac_point_updated") {
        console.log("Applying real-time evacuation point update");
        // For updates, refresh the complete list to reflect changes
        refreshEvacPoints();
      }
    }
  }, [lastUpdate]);

  // Update context with real-time data when available
  useEffect(() => {
    if (realtimeEvacPoints && realtimeEvacPoints.length >= 0) {
      console.log("MapManage: Updating evacuation points from real-time data");
      authContext.setMarkers(realtimeEvacPoints);
    }
  }, [realtimeEvacPoints]);

  // Log real-time updates for debugging
  useEffect(() => {
    if (lastUpdate) {
      console.log("MapManage: Update received:", {
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

  const handleMapPress = async (e) => {
    // 🚫 Don't add a new marker while a callout is open
    if (calloutOpen) {
      setCalloutOpen(false);
      setSelectedMarker(null);
      return;
    }

    if (!markerName) {
      Toast.show(t("manage map insert a name first"), {
        duration: Toast.durations.SHORT,
      });
      return;
    }

    const alreadyExists = authContext.markers.some(
      (item) => item.title === markerName
    );
    if (alreadyExists) {
      Toast.show(t("manage map evac point name already exists"), {
        duration: Toast.durations.LONG,
      });
      return;
    }

    const evacCoordinate = e.nativeEvent?.coordinate;

    const newMarker = {
      key: uuidv4(),
      coordinate: evacCoordinate,
      title: markerName,
      description: t("manage map evac point description"),
      radius: radius,
    };

    const result = await createEvacPointsApi.createEvacPoints(newMarker);
    console.log("add marker api: ", JSON.stringify(result, null, 2));
    if (result.ok && result.data?.evac_points) {
      // The real-time hook will automatically update the markers
      // But we can update locally for immediate feedback
      authContext.setMarkers(result.data.evac_points);
      setMarkerName(""); // Clear input
      console.log("Evacuation point created, real-time update will follow");
    } else {
      const errorMessage = result.data?.error_code
        ? t(result.data.error_code)
        : t("error creating marker");
      Toast.show(errorMessage, {
        duration: Toast.durations.SHORT,
      });
    }
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

  const handleDeleteMarker = async () => {
    if (!selectedMarker) return;

    const result = await deleteEvacPointApi.deleteEvacPoints(
      selectedMarker.evac_point_id
    );
    console.log("delete marker api: ", JSON.stringify(result, null, 2));
    if (result.ok) {
      // The real-time hook will automatically update the markers
      // But we can update locally for immediate feedback
      authContext.setMarkers(result.data.evac_points);
      setSelectedMarker(null);
      console.log("Evacuation point deleted, real-time update will follow");
    } else {
      const errorMessage = result.data?.error_code
        ? t(result.data.error_code)
        : t("error deleting marker");
      Toast.show(errorMessage, {
        duration: Toast.durations.SHORT,
      });
    }
  };

  const handleEnableMarker = async () => {
    if (!selectedMarker) return;

    selectedMarker.active = !selectedMarker.active;
    const result = await updateMarkerApi.updateMarker(selectedMarker);
    console.log("update marker api: ", JSON.stringify(result, null, 2));

    if (result.ok) {
      // The real-time hook will automatically update the markers
      // But we can update locally for immediate feedback
      authContext.setMarkers(result.data.evac_points);
      console.log("Evacuation point updated, real-time update will follow");
    } else {
      const errorMessage = result.data?.error_code
        ? t(result.data.error_code)
        : t("error updating marker");
      Toast.show(errorMessage, {
        duration: Toast.durations.SHORT,
      });
    }
  };

  const handleRegionChange = () => {
    if (!calloutOpen) setSelectedMarker(null);
  };

  useEffect(() => {
    const closestMarkerId = authContext.markersWithDistance[0]?.evac_point_id;
    if (closestMarkerId && closestMarkerId !== closestEvacPointId) {
      setClosestEvacPointId(closestMarkerId);
    }
  }, [authContext.markersWithDistance]);

  // location watcher
  useEffect(() => {
    let locationWatcher;
    (async () => {
      if (hasLocationPermissions) {
        locationWatcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (currentLocation) => setLocation(currentLocation)
        );
      }
    })();
    return () => locationWatcher?.remove();
  }, [hasLocationPermissions]);

  useEffect(() => {
    if (location?.coords) {
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: region?.latitudeDelta || 0.007,
        longitudeDelta: region?.longitudeDelta || 0.007,
      };
      setRegion(newRegion);
    }
  }, [location]);

  useEffect(() => {
    setCalloutOpen(!!selectedMarker);
  }, [selectedMarker]);

  const saveRegion = async (newRegion) => {
    const isSameRegion =
      region &&
      Math.abs(region.latitude - newRegion.latitude) < 0.00005 &&
      Math.abs(region.longitude - newRegion.longitude) < 0.00005 &&
      Math.abs(region.latitudeDelta - newRegion.latitudeDelta) < 0.00005 &&
      Math.abs(region.longitudeDelta - newRegion.longitudeDelta) < 0.00005;

    if (!isSameRegion && !calloutOpen) {
      setSelectedMarker(null);
    }

    if (isSameRegion) return;

    if (!isSameRegion) {
      try {
        await cache.store("region", newRegion);
        setRegion(newRegion);
      } catch (error) {
        console.log("error setting region to storage");
      }
    }

    // Only clear selected marker if region changed due to user interaction, not when a marker is selected
    if (!isSameRegion && !calloutOpen) {
      setSelectedMarker(null);
    }
  };

  const stopTrackingViewChanges = () => {
    setTrackViewChanges(false);
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
            size="large"
            color={colors.brightGreen}
            animating={
              !location ||
              (evacPointsLoading && authContext.markers?.length === 0)
            }
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
      {location && hasLocationPermissions && (
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
          paddingAdjustmentBehavior="never"
          followsUserLocation={false}
          mapType="satellite"
          showsBuildings
          showsIndoors
          showsIndoorLevelPicker
          showsUserLocation
          showsMyLocationButton
          showsCompass
          toolbarEnabled
          zoomEnabled
          rotateEnabled
          region={region}
          onPress={(e) => handleMapPress(e)}
          onRegionChangeComplete={(newRegion) => {
            saveRegion(newRegion);
            handleRegionChange();
          }}
        >
          {authContext.markers?.length > 0 &&
            authContext.markers.map((marker) => (
              <MapMarker
                key={marker.key}
                marker={marker}
                isSelected={selectedMarker?.key === marker.key}
                title={`${marker.title} (${
                  marker.assigned_to == authContext.user.id
                    ? t("assigned to you")
                    : marker.assigned_to
                      ? t("assigned")
                      : t("not assigned")
                })`}
                description={t("click here to delete")}
                strokeColor={
                  !marker.active
                    ? colors.grey
                    : marker.assigned_to == authContext.user.id
                      ? colors.lighterGreen
                      : marker.assigned_to
                        ? colors.lightGreen
                        : colors.orange
                }
                trackViewChanges={trackViewChanges}
                onStopTrackingViewChanges={stopTrackingViewChanges}
                onPress={() => handleMarkerPress(marker)}
              />
            ))}
        </MapView>
      )}

      {selectedMarker && (
        <CustomCallout
          marker={selectedMarker}
          onDelete={handleDeleteMarker}
          onUpdate={handleEnableMarker}
          onClose={() => {
            setSelectedMarker(null);
            setCalloutOpen(false);
          }}
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
  map: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    height: "auto",
    width: "100%",
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
  distanceText: {
    textAlign: "center",
    paddingTop: 4,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMarkerSet: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
});

export default MapManage;
