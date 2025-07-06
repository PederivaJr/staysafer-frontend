import client from "./clientController";

const duplicateList = (list_id) =>
  client.post(`/list/${list_id}/duplicate`, {});

export default {
  duplicateList,
};
