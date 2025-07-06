import client from "./clientController";

const updateLocalContact = (
  contact_id,
  firstname,
  lastname,
  phone_number,
  list_id
) =>
  client.put(`/localContacts/${contact_id}`, {
    contact_id: contact_id,
    firstname: firstname,
    lastname: lastname,
    phone: phone_number,
    list_id: list_id,
  });

export default {
  updateLocalContact,
};
