import client from "./clientController";

const login = (email, password) => client.post("/login", { email, password });

export default {
  login,
};
