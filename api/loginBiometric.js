import client from "./client";

const endpoint = "/login-biometric";

const loginBiometric = (id, token) =>
  client.post(
    endpoint,
    { user_id: id },
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

export default {
  loginBiometric,
};
