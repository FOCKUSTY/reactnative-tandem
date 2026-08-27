import axios from "axios";
import { storage } from "../utils/storage";

export const API_BASE = "http://192.168.0.100:8080/api";

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
    `${response.config.baseURL}${response.config.url}`,
    response.status,
    response.statusText,
  );
  return response;
});

export default api;
