import client from "./clientController";

const forgotPassword = (email) => client.post("/forgot-password", { email });

export default {
  forgotPassword,
};
