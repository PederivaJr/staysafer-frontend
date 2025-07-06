import client from "./clientController";

const createEvacuation = (evac_type, list_id) =>
  client.post(`/evacuation`, { evac_type: evac_type, list_id: list_id });

export default {
  createEvacuation,
};
