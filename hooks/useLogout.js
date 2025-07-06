import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import storage from "../auth/storage";

const useLogout = () => {
  const authContext = useContext(AuthContext);

  const logout = async () => {
    authContext.setUser(null);
    await storage.removeToken();
    await storage.removeUser();
  };

  return logout;
};

export default useLogout;
