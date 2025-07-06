import client from "./clientController";

const getEvacListUsers = (list_id) =>
  client.get(`/user-to-list/${list_id}`, {});

export default {
  getEvacListUsers,
};
