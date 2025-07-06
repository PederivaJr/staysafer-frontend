import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useActiveSafetyMethods = () => {
  const [activeCount, setActiveCount] = useState(0);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const countActiveSafetyMethods = () => {
      let settings = authContext.settings;
      const activeKeys = Object.keys(settings).filter((key) =>
        key.endsWith("_active")
      );
      const count = activeKeys.reduce((count, key) => {
        return count + (settings[key] === true ? 1 : 0);
      }, 0);
      setActiveCount(count);
    };

    countActiveSafetyMethods();
  }, [authContext.settings]);

  return activeCount;
};

export default useActiveSafetyMethods;
