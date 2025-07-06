import client from "./clientOnesignal";

const endpoint = "/v1/apps/";

const getOnesignalUser = (app_id, user_id) =>
  client.get(
    endpoint + app_id + "/users/by/external_id/" + user_id,
    {},
    {
      headers: {
        Accept: "application/json"
      },
    }
  );

export default {
  getOnesignalUser,
};
