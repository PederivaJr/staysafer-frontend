import client from "./clientController";

const createAffiliation = (affiliation_id) =>
  client.post(`/user/affiliation`, { affiliation_id: affiliation_id });

export default {
  createAffiliation,
};
