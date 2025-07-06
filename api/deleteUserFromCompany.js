import client from "./clientController";

const removeUserFromCompany = (user_id) => {
  return client.put(`/user/${user_id}/change-company`, {});
};

export default {
  removeUserFromCompany,
};
