import axios from "axios";
import { storage } from "../utils";
import { API_BASE, OFFLINE_CONFIG } from "../constants";
import { logger } from "../utils/logger.utils";
import Toast from "react-native-toast-message";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: OFFLINE_CONFIG.API_TIMEOUT,
});

api.interceptors.request.use(async (config) => {
  if (__DEV__) {
    void logger.debug("API Request", {
      url: config.url,
      method: config.method,
    });
  }
  const token = await storage.getItem(".auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      void logger.debug("API Response", {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      error.isTimeout = true;

      Toast.show({
        type: "error",
        text1: "Сервер недоступен",
        text2: "Проверьте подключение к интернету или попробуйте позже.",
        position: "bottom",
        visibilityTime: 4000,
      });
    }

    void logger.error("Axios Interceptor Error", {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      response: error.response?.data,
      isTimeout: error.isTimeout,
    });

    return Promise.reject(error);
  },
);

export default api;
