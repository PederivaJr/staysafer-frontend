import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  PermissionsAndroid,
} from "react-native";
import colors from "../config/color";
import {
  NAVIGATION_TREE,
  RSSI_1M as INITIAL_RSSI_1M,
  PATH_LOSS as INITIAL_PATH_LOSS,
  BLE_DIRECTION_THRESHOLD,
} from "../config/globals";
import { Ionicons } from "@expo/vector-icons"; // For caret icons
import { BleManager } from "react-native-ble-plx";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";

// Function to calculate direction based on orientation difference
const getDirection = (deviceOrientation) => {
  const angleDifference = deviceOrientation;
  if (
    angleDifference >= 360 - BLE_DIRECTION_THRESHOLD ||
    angleDifference <= BLE_DIRECTION_THRESHOLD
  ) {
    return "Go straight";
  } else if (
    angleDifference > 180 - BLE_DIRECTION_THRESHOLD &&
    angleDifference < 180 + BLE_DIRECTION_THRESHOLD
  ) {
    return "Go back";
  } else if (
    angleDifference > 90 - BLE_DIRECTION_THRESHOLD &&
    angleDifference < 90 + BLE_DIRECTION_THRESHOLD
  ) {
    return "Go right";
  } else if (
    angleDifference > 270 - BLE_DIRECTION_THRESHOLD &&
    angleDifference < 270 + BLE_DIRECTION_THRESHOLD
  ) {
    return "Go left";
  }
  return "Turn more";
};

const BeaconScanner = () => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [orientation, setOrientation] = useState(0);
  const [direction, setDirection] = useState("");
  const [rssi1m, setRssi1m] = useState(INITIAL_RSSI_1M);
  const [pathLoss, setPathLoss] = useState(INITIAL_PATH_LOSS);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const manager = useRef(new BleManager()).current;

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted =
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;

        if (!allGranted) {
          Alert.alert(
            "Permission Required",
            "Bluetooth and Location permissions are required for beacon scanning."
          );
          return false;
        }
      } catch (error) {
        console.error("Android Permission error:", error);
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
      } catch (error) {
        console.error("iOS Permission error:", error);
        return false;
      }
    }

    // Request Magnetometer permission
    try {
      const magnetometerAvailable = await Magnetometer.isAvailableAsync();
      if (!magnetometerAvailable) {
        Alert.alert(
          "Magnetometer Unavailable",
          "Your device does not support magnetometer-based direction sensing."
        );
      }
    } catch (error) {
      console.error("Magnetometer error:", error);
    }

    return true;
  };
  // request permissions and setup sensors
  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      if (!granted) return;

      // Start Magnetometer updates
      Magnetometer.setUpdateInterval(1000);
      const subscription = Magnetometer.addListener(({ x, y }) => {
        const angle = Math.round(Math.atan2(y, x) * (180 / Math.PI));
        const normalizedAngle = angle >= 0 ? angle : angle + 360;
        setOrientation(normalizedAngle);
        setDirection(getDirection(normalizedAngle));
      });

      return () => subscription.remove();
    })();
  }, []);
  // stop scanning on unmount
  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);

  const calculateDistance = (rssi) => {
    if (rssi === null) return null;
    return Math.pow(10, (rssi1m - rssi) / (10 * pathLoss)).toFixed(2);
  };

  const togglePanel = () => setIsPanelVisible((prev) => !prev);

  // manage BT scanning
  const startScanning = () => {
    setScanning(true);
    setDevices([]);

    const allowedBeaconIds = Object.values(NAVIGATION_TREE).map(
      (node) => node.beaconId
    );

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Device scan error:", error);
        setScanning(false);
        return;
      }
      if (device && allowedBeaconIds.includes(device.id)) {
        setDevices((prevDevices) => {
          const existingDeviceIndex = prevDevices.findIndex(
            (d) => d.id === device.id
          );
          if (existingDeviceIndex !== -1) {
            const updatedDevices = [...prevDevices];
            updatedDevices[existingDeviceIndex] = {
              ...updatedDevices[existingDeviceIndex],
              rssi: device.rssi,
              distance: calculateDistance(device.rssi),
            };
            return updatedDevices.sort((a, b) => b.rssi - a.rssi).slice(0, 5);
          }

          return [
            ...prevDevices,
            {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
              distance: calculateDistance(device.rssi),
            },
          ]
            .sort((a, b) => b.rssi - a.rssi)
            .slice(0, 5);
        });
      }
    });
  };
  const stopScanning = () => {
    setScanning(false);
    manager.stopDeviceScan();
  };

  const toggleScanning = () => (scanning ? stopScanning() : startScanning());

  // handle calibration values (rssi, path loss)
  // TODO add translations
  const handleRssiSubmit = () => {
    const newRssi = parseFloat(rssi1m);
    if (isNaN(newRssi)) {
      Alert.alert("Invalid RSSI", "Please enter a valid number for RSSI.");
      return;
    }
    setRssi1m(newRssi);
    Keyboard.dismiss();
  };
  const handlePathLossSubmit = () => {
    const newPathLoss = parseFloat(pathLoss);
    if (isNaN(newPathLoss)) {
      Alert.alert(
        "Invalid Path Loss",
        "Please enter a valid number for Path Loss."
      );
      return;
    }
    setPathLoss(newPathLoss);
    Keyboard.dismiss();
  };

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.deviceItem}>
        <Text style={styles.deviceText}>
          {item.name && `Name: ${item.name}${"\n"}`}
          ID: {item.id} {"\n"}
          Distance: {item.distance !== null
            ? `${item.distance} m`
            : "Unknown"}{" "}
          {"\n"}
          RSSI: {item.rssi}
          {"\n"}
          Orientation: {orientation}° {"\n"}
          Direction: {direction}
        </Text>
      </View>
    ),
    [orientation, direction]
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
      />
      <TouchableOpacity onPress={toggleScanning} style={styles.scanButton}>
        <Text style={styles.scanButtonText}>
          {scanning ? "Stop Scanning" : "Start Scanning"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={togglePanel} style={styles.panelToggle}>
        <Ionicons
          name={isPanelVisible ? "caret-down" : "caret-up"}
          size={24}
          color={colors.grey}
        />
        <Text style={styles.panelToggleText}>
          {isPanelVisible ? "Hide Calibration" : "Show Calibration"}
        </Text>
      </TouchableOpacity>
      {isPanelVisible && (
        <View style={styles.panel}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>RSSI @ 1m: </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(rssi1m)}
              onChangeText={setRssi1m}
              onSubmitEditing={handleRssiSubmit}
              placeholder="RSSI @ 1m"
              returnKeyType="done"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Path loss: </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(pathLoss)}
              onChangeText={setPathLoss}
              onSubmitEditing={handlePathLossSubmit}
              placeholder="Path Loss"
              returnKeyType="done"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.lighterGrey,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  listContainer: {
    width: "100%",
    paddingBottom: 20,
  },
  deviceItem: {
    padding: 8,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  deviceText: {
    fontSize: 16,
  },
  scanButton: {
    alignSelf: "center",
    padding: 12,
    backgroundColor: colors.darkGrey,
    borderRadius: 8,
    marginVertical: 16,
  },
  scanButtonText: {
    color: colors.white,
  },
  panelToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  panelToggleText: {
    marginLeft: 8,
    fontSize: 16,
  },
  panel: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.lighterGrey,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputLabel: {
    flexBasis: "40%",
    flexGrow: 1,
  },
  input: {
    flexBasis: "20%",
    flexGrow: 0,
    borderWidth: 1,
    borderColor: colors.grey,
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default BeaconScanner;
