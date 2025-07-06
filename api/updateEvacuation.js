import client from "./clientController";

const updateEvacuation = (id, list_id) =>
  client.put(`/evacuation/${id}`, { list_id: list_id });

export default {
  updateEvacuation,
};
