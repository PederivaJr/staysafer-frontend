import client from "./clientController";

const updateTempContact = (temp_id, name, count, phone, expire, list_id) =>
  client.put(`/temp-contacts/${temp_id}`, {
    temp_id: temp_id,
    name: name,
    count: count,
    phone: phone,
    expire: expire,
    list_id: list_id,
  });

export default {
  updateTempContact,
};
