import { useEffect, useContext, useRef } from "react";
import { AppState } from "react-native";
import { AuthContext } from "../context/AuthContext";
import storage from "../auth/storage";

const isTokenExpired = async () => {
  const token = await storage.getToken();
  const expirationString = token?.auth_expiration;

  if (expirationString) {
    const [datePart, timePart] = expirationString.split(" ");
    const [day, month, year] = datePart.split(".");
    const expirationDate = new Date(`${year}-${month}-${day}T${timePart}`);
    const now = new Date();

    if (expirationDate < now) {
      await storage.removeToken();
      await storage.removeUser();
      return true;
    }
    return false;
  }

  return true; // If no expiration date, treat as expired
};

const useCheckAuthToken = () => {
  const { setUser, setAuthTokenChecked } = useContext(AuthContext);
  const appState = useRef(AppState.currentState);

  const checkAuth = async () => {
    try {
      const user = await storage.getUser();
      const tokenExpired = await isTokenExpired();

      if (user && !tokenExpired) {
        setUser(user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth bootstrap failed", err);
      setUser(null);
    } finally {
      setAuthTokenChecked(true);
    }
  };

  // check auth token expired if app was in background
  useEffect(() => {
    checkAuth(); // Run once on mount

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkAuth(); // Re-run token check on resume
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);
};

export default useCheckAuthToken;
