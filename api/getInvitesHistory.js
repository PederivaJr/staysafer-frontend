import { auditEvents } from "@trycourier/courier/lib/audit-events";
import client from "./clientController";

const getInvitesHistory = () => client.get("/invites/history", {});

export default {
  getInvitesHistory,
};
