import client from "./clientController";

const updateMarker = (marker) =>
  client.put(`/evac-point/${marker.evac_point_id}`, marker);

export default {
  updateMarker,
};
