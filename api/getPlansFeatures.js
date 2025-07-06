import client from "./clientController";

const getPlanFeatures = () => client.get("/plan/features", {});

export default {
  getPlanFeatures,
};
