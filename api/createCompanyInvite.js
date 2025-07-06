import client from "./clientController";

const createCompanyInvite = (data) => client.post("/invites/mail", data);

export default {
  createCompanyInvite,
};
