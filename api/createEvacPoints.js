import client from "./clientController";

const createEvacPoints = (data) => client.post(`/evac-point`, data);

export default {
  createEvacPoints,
};
