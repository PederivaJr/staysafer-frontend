import { auditEvents } from "@trycourier/courier/lib/audit-events";
import client from "./clientController";

const getEvacList = (list_id) => client.get(`/list/${list_id}`, {});

export default {
  getEvacList,
};
