import axios from "axios";

import { storage } from "../utils";
import { API_BASE } from "../constants";
import { logger } from "../utils/logger.utils";

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

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      logger.debug("API Response", {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    logger.error("Axios Interceptor Error", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return Promise.reject(error);
  },
);

export default api;
