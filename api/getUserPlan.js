import client from "./clientController";

const getUserPlan = (user_id) => client.get(`/user/${user_id}/plan`, {});

export default {
  getUserPlan,
};
