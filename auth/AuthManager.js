import storage from "./storage";

let setUserCallback = null;

const setLogoutHandlers = ({ setUser }) => {
  setUserCallback = setUser;
};

const logout = async () => {
  if (setUserCallback) setUserCallback(null);
  await storage.removeUser();
  await storage.removeToken();
};

export default {
  setLogoutHandlers,
  logout,
};
