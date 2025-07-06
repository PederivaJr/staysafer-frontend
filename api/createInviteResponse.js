import client from "./clientController";

const createInviteResponse = (data) => client.post("/invites/response", data);

export default {
  createInviteResponse,
};
