import client from "./clientController";

const restorePurchase = () => client.get("/purchase/restore", {});

export default {
  restorePurchase,
};
