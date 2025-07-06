import client from "./clientController";

const updateSettings = (data) => client.put("/settings", data);

export default {
  updateSettings,
};
