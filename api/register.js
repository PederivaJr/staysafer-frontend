import client from "./clientController";

const register = (data) => client.post("/register", data);

export default {
  register,
};
