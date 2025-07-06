import client from "./clientController";

const deletePendingInvite = (id) => {
  return client.delete(`/invites/${id}`, {});
};

export default {
  deletePendingInvite,
};
