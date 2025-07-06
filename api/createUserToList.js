import client from "./clientController";

const createUserToList = (data) => client.post("/user-to-list", data);

export default {
  createUserToList,
};
