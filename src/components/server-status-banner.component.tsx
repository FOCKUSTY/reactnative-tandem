import { View, Text, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { useTheme } from "../contexts";
import axios from "axios";
import { API_BASE, OFFLINE_CONFIG } from "../constants";

export const ServerStatusBanner = () => {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const netInfo = useNetInfo();
  const [hasError, setHasError] = useState(false);

  const checkHealth = async () => {
    try {
      const baseUrl = API_BASE.replace(/\/api$/, "");
      const response = await axios.get(`${baseUrl}/health`, {
        timeout: OFFLINE_CONFIG.HEALTH_CHECK_TIMEOUT,
      });
      if (response.status === 200 && response.data?.status === "ok") {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let intervalId: number | null = null;
    let isMounted = true;

    const performHealthCheck = async () => {
      if (netInfo.isConnected === false) {
        if (isMounted) setHasError(false);
        return;
      }
      const isHealthy = await checkHealth();
      if (isMounted) {
        setHasError(!isHealthy);
      }
    };

    performHealthCheck();
    intervalId = setInterval(
      performHealthCheck,
      OFFLINE_CONFIG.HEALTH_CHECK_INTERVAL,
    );

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [netInfo.isConnected]);

  useEffect(() => {
    const isServerError = (error: any) => {
      if (!error) return false;
      if (error.isTimeout) return true;
      if (error.status && (error.status >= 500 || error.status === 0))
        return true;
      if (
        error.message &&
        (error.message.includes("timeout") ||
          error.message.includes("network") ||
          error.message.includes("ECONNABORTED"))
      )
        return true;
      return false;
    };

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.action.error as any;
        if (isServerError(error)) {
          setHasError(true);
        }
      } else if (event.type === "updated" && event.action.type === "success") {
        setHasError(false);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  if (netInfo.isConnected === false) return null;
  if (!hasError) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.danger }]}>
      <Text style={styles.text}>
        Сервер временно недоступен. Данные из кэша.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { padding: 8, alignItems: "center" },
  text: { color: "#fff", fontWeight: "600" },
});
