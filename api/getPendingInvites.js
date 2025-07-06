import client from "./clientController";

const getPendingInvites = () => client.get("/invites", {});

export default {
  getPendingInvites,
};
