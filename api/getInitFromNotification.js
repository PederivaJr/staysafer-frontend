import client from "./clientController";

const getInitFromNotification = (data) => client.get("/getInit", data);

export default {
  getInitFromNotification,
};
