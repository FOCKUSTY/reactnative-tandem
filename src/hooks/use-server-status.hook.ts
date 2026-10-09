import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { OFFLINE_CONFIG } from "../constants";
import { getApiUrl, subscribeApiUrl } from "../config";
import { logger } from "../utils";

export const useServerStatus = () => {
  const queryClient = useQueryClient();
  const [isServerAvailable, setIsServerAvailable] = useState<boolean>(true);

  useEffect(() => {
    let intervalId: number | null = null;

    const checkHealth = async () => {
      try {
        const baseUrl = getApiUrl().replace(/\/api$/, "");
        const response = await axios.get(`${baseUrl}/health`, {
          timeout: OFFLINE_CONFIG.HEALTH_CHECK_TIMEOUT,
        });
        const ok = response.status === 200 && response.data?.status === "ok";
        setIsServerAvailable(ok);
        void logger.debug("Health check", { ok, status: response.status });
      } catch (error) {
        setIsServerAvailable(false);
        void logger.warn("Health check failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    checkHealth();
    const unsubscribe = subscribeApiUrl(() => {
      void checkHealth();
    });
    intervalId = setInterval(() => {
      checkHealth();
    }, OFFLINE_CONFIG.HEALTH_CHECK_INTERVAL);

    return () => {
      unsubscribe();
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
