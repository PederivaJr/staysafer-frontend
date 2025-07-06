import client from "./clientController";

const getEventStats = (event_id) => client.get(`/stats/event/${event_id}`, {});

export default {
  getEventStats,
};
