import { create } from "apisauce";
import Toast from "react-native-root-toast";
import i18n from "../config/lang/i18n";
import storage from "../auth/storage";
import AuthManager from "../auth/AuthManager";

const t = i18n.t;

const clientController = create({
  // baseURL: "https://livedb.staysafer.ch/api",
  baseURL: "http://192.168.1.80:8002/api",
  timeout: 15000,
});

// Add the token to every request
clientController.addAsyncRequestTransform(async (request) => {
  const token = await storage.getToken();
  if (token?.auth) {
    request.headers.Authorization = `Bearer ${token.auth}`;
  }
});

// Handle responses globally
clientController.addResponseTransform(async (response) => {
  const showToast = response.config?.showToast;
  if (!response.ok) {
    const errCode = response.data?.error_code;
    // token expired, logout user
    if (errCode === "err_token_1") {
      await AuthManager.logout();
    }
    // show a toast with the error by default, unless showToast is set to false
    if (showToast) {
      Toast.show(t(errCode || "toast error general"), {
        dduration: Toast.durations.LONG,
        position: Toast.positions.TOP, // Adjust based on safe area
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
    }
  }
});

export default clientController;
