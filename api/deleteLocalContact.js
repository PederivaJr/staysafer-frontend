import client from "./clientController";

//TODO check after removed token from body
const deleteLocalContact = (contact_id, list_id) => {
  return client.delete(`/localContacts/${contact_id}`, { list_id: list_id });
};

export default {
  deleteLocalContact,
};
