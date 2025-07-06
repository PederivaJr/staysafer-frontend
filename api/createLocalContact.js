import client from "./clientController";

const createLocalContact = (data) => client.post("/localContacts", data);

export default {
  createLocalContact,
};
