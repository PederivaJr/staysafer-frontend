import client from "./clientController";

const getProfile = (user_id, showToast = true) =>
  client.get(`/user/${user_id}`, null, { showToast });

export default {
  getProfile,
};
