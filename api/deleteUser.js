import client from "./clientController";

const deleteUser = (user_id) => client.delete(`/user/${user_id}`);

export default {
  deleteUser,
};
