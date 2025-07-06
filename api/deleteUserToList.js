import client from "./clientController";

const deleteUserToList = (contact) => {
  return client.delete("/user-to-list", contact);
};

export default {
  deleteUserToList,
};
