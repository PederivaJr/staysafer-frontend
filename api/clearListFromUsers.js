import client from "./clientController";

const clearListFromUsers = (list_id) =>
  client.post(`/list/${list_id}/clear`, {});

export default {
  clearListFromUsers,
};
