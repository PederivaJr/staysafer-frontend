import client from "./clientController";

const createTempContact = (data) => client.post("/temp-contacts", data);

export default {
  createTempContact,
};
