import { auditEvents } from "@trycourier/courier/lib/audit-events";
import client from "./clientController";

const getEvacPoints = () => client.get(`/evac-point/company`, {});

export default {
  getEvacPoints,
};
