import { useState, useEffect, useContext } from "react";
import * as Location from "expo-location";
import { AuthContext } from "../context/AuthContext";
import cache from "../utility/cache";

const useLocation = () => {
  const [location, setLocation] = useState();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const locationPermission =
        await Location.requestForegroundPermissionsAsync();
      //TODO add toast
      if (!locationPermission.granted)
        return alert("the app needs your location to set the evacuation point");
      const lastLocation = await Location.getLastKnownPositionAsync();
      setLocation(lastLocation);
      const region = {
        latitude: lastLocation.coords.latitude,
        longitude: lastLocation.coords.longitude,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      };
      authContext.setMapRegion(region);
      try {
        await cache.store("region", region);
      } catch (error) {
        console.log("error storing region to storage");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return location;
};

export default useLocation;
