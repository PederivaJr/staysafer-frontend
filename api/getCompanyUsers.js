import { auditEvents } from "@trycourier/courier/lib/audit-events";
import client from "./clientController";

const getCompanyUsers = (company_id) =>
  client.get(`/company/${company_id}/users`, {});

export default {
  getCompanyUsers,
};
