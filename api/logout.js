import client from "./clientController";

const logout = (config = {}) => client.post("/logout", {}, config);

export default {
  logout,
};
