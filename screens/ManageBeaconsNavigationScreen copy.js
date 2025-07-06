import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import { BleManager } from "react-native-ble-plx";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/color";
import {
  RSSI_1M,
  PATH_LOSS,
  NAVIGATION_TREE,
  DEFAULT_DISTANCE_THRESHOLD,
} from "../config/globals";

const DIRECTION_ICONS = {
  straight: "arrow-up",
  back: "arrow-down",
  left: "arrow-left-top",
  right: "arrow-right-top",
  arrived: "check-circle-outline",
};

const ManageBeaconsNavigationScreen = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [targetRoom, setTargetRoom] = useState(null);
  const [nextStep, setNextStep] = useState("");
  const [arrowDirection, setArrowDirection] = useState(null); // For directional arrows
  const [scanning, setScanning] = useState(true);
  const { t } = useTranslation();
  const bleManager = new BleManager();

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error("Permission error:", error);
        return false;
      }
    } else if (Platform.OS === "ios") {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Location permissions are needed to scan for beacons."
          );
          return false;
        }
        return true;
      } catch (error) {
        console.error("iOS Permission error:", error);
        return false;
      }
    }
    return true;
  };
  // request BT permissions
  useEffect(() => {
    (async () => {
      const granted = await requestBluetoothPermissions();
      //TODO change alert
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Bluetooth permissions are required."
        );
      }
    })();

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = bleManager.onStateChange((state) => {
      if (state === "PoweredOn") {
        startScanning();
      } else {
        bleManager.stopDeviceScan();
      }
    }, true);

    return () => subscription.remove();
  }, []);

  const startScanning = () => {
    setScanning(true);

    const allowedBeaconIds = Object.values(NAVIGATION_TREE).map(
      (node) => node.beaconId
    );

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }

      if (allowedBeaconIds.includes(device.id) && device.rssi !== null) {
        const detectedRoom = identifyRoomByBeacon(device);
        const distance = calculateDistance(device.rssi);

        if (
          detectedRoom &&
          currentRoom !== detectedRoom &&
          distance <= DEFAULT_DISTANCE_THRESHOLD
        ) {
          setCurrentRoom(detectedRoom);
          setScanning(false); // Stop scanning when a room is found
        }
      }
    });
  };

  const stopScanning = () => {
    bleManager.stopDeviceScan();
    setScanning(false);
  };

  const identifyRoomByBeacon = (device) => {
    return Object.keys(NAVIGATION_TREE).find(
      (room) => NAVIGATION_TREE[room].beaconId === device.id
    );
  };

  const calculateDistance = (rssi) => {
    return Math.pow(10, (RSSI_1M - rssi) / (10 * PATH_LOSS));
  };
  // next step
  useEffect(() => {
    if (currentRoom && targetRoom) {
      calculateNextStep(currentRoom, targetRoom);
    }
  }, [currentRoom, targetRoom]);

  const calculateNextStep = (current, target) => {
    if (current === target) {
      setNextStep(t("arrived"));
      setArrowDirection("arrived");
      stopScanning();
    } else {
      determineDirection(current, target);
    }
  };

  const determineDirection = (current, target) => {
    const connectedRooms = NAVIGATION_TREE[current]?.connectedTo || [];
    if (connectedRooms.includes(target)) {
      setNextStep(t("exit office"));
      setArrowDirection("straight");
    } else if (connectedRooms.includes("Intersection")) {
      setNextStep(t("go to intersection"));
      setArrowDirection("straight");
    } else {
      setNextStep(t("unknown_path"));
      setArrowDirection(null);
    }
  };
  // Re-enable scanning if a new destination is selected
  const handleTargetChange = (newTarget) => {
    setTargetRoom(newTarget);
    if (newTarget) {
      startScanning();
    }
  };

  const getRoomName = (roomKey) => {
    return roomKey
      ? NAVIGATION_TREE[roomKey]?.name || t("unknown")
      : t("unknown");
  };

  return (
    <View style={styles.container}>
      {scanning && !currentRoom ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brightGreen} />
          <Text style={styles.infoText}>{t("scanning")}...</Text>
        </View>
      ) : (
        <>
          <View style={styles.locationContainer}>
            <View style={styles.locationLabel}>
              <View style={styles.locationIcon}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={32}
                  color={colors.darkGrey}
                />
              </View>
              <View style={styles.locationWrapper}>
                <Text style={styles.infoText}>{getRoomName(currentRoom)}</Text>
              </View>
            </View>
            <View style={styles.locationLabel}>
              <View style={styles.locationIcon}>
                <MaterialCommunityIcons
                  name="target"
                  size={32}
                  color={colors.darkGrey}
                />
              </View>
              <View style={styles.locationWrapperPicker}>
                <Picker
                  selectedValue={targetRoom}
                  onValueChange={handleTargetChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label={t("select destination")} value={null} />
                  {Object.keys(NAVIGATION_TREE).map((roomKey) => (
                    <Picker.Item
                      key={roomKey}
                      label={NAVIGATION_TREE[roomKey].name}
                      value={roomKey}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.directionContainer}>
            {arrowDirection && (
              <MaterialCommunityIcons
                name={DIRECTION_ICONS[arrowDirection]}
                size={160}
                color={
                  arrowDirection === "arrived"
                    ? colors.brightGreen
                    : colors.darkGrey
                }
              />
            )}
            <Text style={styles.directionText}>
              {nextStep || t("select destination")}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: colors.lighterGrey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "column",
    marginBottom: 20,
    gap: 4,
  },
  locationIcon: {
    flexBasis: "8%",
    justifyContent: "center",
  },
  locationLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 16,
    gap: 16,
  },
  locationWrapper: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 28,
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  locationWrapperPicker: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 28,
    paddingHorizontal: 4,
  },
  picker: {
    marginLeft: 0,
    flex: 1,
    fontSize: 18,
  },
  pickerItem: {
    fontSize: 16,
  },
  directionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  directionText: {
    fontSize: 32,
    marginTop: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ManageBeaconsNavigationScreen;
