import client from "./clientController";

const deleteEvacPoints = (evac_point_id) => {
  return client.delete(`/evac-point/${evac_point_id}`, {});
};

export default {
  deleteEvacPoints,
};
