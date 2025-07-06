import { auditEvents } from "@trycourier/courier/lib/audit-events";
import client from "./clientController";

const getEventsHistory = () => client.get("/evacuation/history", {});

export default {
  getEventsHistory,
};
