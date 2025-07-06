import client from "./clientController";

const recreateTempContact = (data) =>
  client.post("/temp-contacts/recreate", data);

export default {
  recreateTempContact,
};
