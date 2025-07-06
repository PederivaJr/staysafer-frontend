import client from "./clientController";

const init = (showToast = true, options = {}) =>
  client.get(`/init`, null, { showToast, ...options });

export default {
  init,
};
