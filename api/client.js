import { create } from "apisauce";

const ApiClient = create({
  // baseURL: "https://livedb.staysafer.ch/api",
  baseURL: "http://192.168.1.80:8002/api",
  timeout: 15000,
});

export default ApiClient;
