import client from "./clientController";

// TODO check after removing token from body
const deleteTempContact = (temp_id, list_id) => {
  return client.delete(`/temp-contacts/${temp_id}`, { list_id: list_id });
};

export default {
  deleteTempContact,
};
