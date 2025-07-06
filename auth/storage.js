import * as SecureStore from "expo-secure-store";

const storeToken = async (authToken) => {
  try {
    if (authToken)
      await SecureStore.setItemAsync("authToken", JSON.stringify(authToken));
  } catch (error) {
    console.log("error storing token", error);
  }
};
const getToken = async () => {
  try {
    const authToken = await SecureStore.getItemAsync("authToken");
    return authToken ? JSON.parse(authToken) : null;
  } catch (error) {
    console.log("error retrieving token", error);
  }
};
const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync("authToken");
  } catch (error) {
    console.log("error deleting token", error);
  }
};

const storeBiometricKey = async (userId) => {
  await SecureStore.setItemAsync("biometricKey", userId.toString());
};
const getBiometricKey = async () => {
  const value = await SecureStore.getItemAsync("biometricKey");
  return value ? parseInt(value) : null;
};
const removeBiometricKey = async () => {
  try {
    await SecureStore.deleteItemAsync("biometricKey");
  } catch (error) {
    console.log("error deleting biometric key", error);
  }
};

const storeUser = async (user) => {
  try {
    await SecureStore.setItemAsync("user", JSON.stringify(user));
  } catch (error) {
    console.log("error storing user", error);
  }
};
const getUser = async () => {
  try {
    const userData = await SecureStore.getItemAsync("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.log("error retrieving user", error);
  }
};
const removeUser = async () => {
  try {
    await SecureStore.deleteItemAsync("user");
  } catch (error) {
    console.log("error deleting user", error);
  }
};

export default {
  getToken,
  storeToken,
  removeToken,
  storeBiometricKey,
  getBiometricKey,
  removeBiometricKey,
  getUser,
  storeUser,
  removeUser,
};
