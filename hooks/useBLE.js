/* // hooks/useBLE.js
import { useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, BleError } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";

const bleManager = new BleManager();

function useBLE() {
  const [allDevices, setAllDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth scanning requires location access",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const bluetoothScanPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: "Bluetooth Scan Permission",
            message: "Bluetooth scanning requires location access",
            buttonPositive: "OK",
          }
        );
        const bluetoothConnectPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: "Bluetooth Connect Permission",
            message: "Bluetooth connection requires permission",
            buttonPositive: "OK",
          }
        );
        const fineLocationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth scanning requires location access",
            buttonPositive: "OK",
          }
        );
        return (
          bluetoothScanPermission === "granted" &&
          bluetoothConnectPermission === "granted" &&
          fineLocationPermission === "granted"
        );
      }
    }
    return true;
  };

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        return;
      }
      if (device && device.name && device.name.includes("Minew")) {
        setAllDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
  };

  const connectToDevice = async (device) => {
    try {
      const connected = await bleManager.connectToDevice(device.id);
      setConnectedDevice(connected);
      await connected.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      console.log("Connected to:", connected.name);
    } catch (error) {
      console.log("Connection error:", error);
    }
  };

  return {
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    allDevices,
    connectedDevice,
  };
}

export default useBLE;
 */
