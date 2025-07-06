import client from "./clientController";

const assignManagerToEvacPoint = (data) =>
  client.put(`/evac-point/${data.evac_point_id}/assign`, data);

export default {
  assignManagerToEvacPoint,
};
