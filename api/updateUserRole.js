import client from "./clientController";

const updateUserRole = (data) => client.put(`/user/${data.user_id}/role`, data);

export default {
  updateUserRole,
};
