import client from "./clientController";

const createCompanyInviteQr = (data) => client.post("/invites/qr", data);

export default {
  createCompanyInviteQr,
};
