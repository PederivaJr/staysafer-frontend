import client from "./clientController";

const listSelectedContactsCheckins = (list_id) =>
  client.get(`/checkin/${list_id}`, {});

export default {
  listSelectedContactsCheckins,
};
