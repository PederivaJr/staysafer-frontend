import client from "./clientController";

const createCheckin = (data) => client.post(`/checkin`, data);

export default {
  createCheckin,
};
