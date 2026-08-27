import axios from "axios";

import { storage } from "../utils";
import { API_BASE } from "../constants";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  console.log("Request URL:", `${config.baseURL}${config.url}`);

  const token = await storage.getItem(".auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(async (response) => {
  console.log(
    "Response URL:",
    `${response.config.baseURL}${response.config.url}`,
    response.status,
    response.statusText,
  );
  return response;
});

export default api;
