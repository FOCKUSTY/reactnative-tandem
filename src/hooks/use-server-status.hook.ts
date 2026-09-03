import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE, OFFLINE_CONFIG } from "../constants";

export const useServerStatus = () => {
  const queryClient = useQueryClient();
  const [isServerAvailable, setIsServerAvailable] = useState<boolean>(true);

  useEffect(() => {
    let intervalId: number | null = null;

    const checkHealth = async () => {
      try {
        const baseUrl = API_BASE.replace(/\/api$/, "");
        const response = await axios.get(`${baseUrl}/health`, {
          timeout: OFFLINE_CONFIG.HEALTH_CHECK_TIMEOUT,
        });
        console.log(response.status, response.data);
        setIsServerAvailable(
          response.status === 200 && response.data?.status === "ok",
        );
      } catch (error) {
        console.log(error);
        setIsServerAvailable(false);
      }
    };

    checkHealth();
    intervalId = setInterval(() => {
      checkHealth();
    }, OFFLINE_CONFIG.HEALTH_CHECK_INTERVAL);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const isServerError = (error: any) => {
      if (!error) return false;
      if (error.isTimeout) return true;
      if (error.status && (error.status >= 500 || error.status === 0))
        return true;
      if (
        error.message?.includes("timeout") ||
        error.message?.includes("ECONNABORTED")
      )
        return true;
      return false;
    };

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.action.error as any;
        if (isServerError(error)) {
          setIsServerAvailable(false);
        }
      } else if (event.type === "updated" && event.action.type === "success") {
        setIsServerAvailable(true);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return {
    isServerAvailable,
  };
};
