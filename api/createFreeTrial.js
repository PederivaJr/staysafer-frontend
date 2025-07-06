import client from "./clientController";

const createFreeTrial = (data) => client.post("/trial", data);

export default {
  createFreeTrial,
};
