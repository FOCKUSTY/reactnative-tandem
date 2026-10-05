import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/query-persist-client-core";

import { initI18n } from "./i18n";
import { logger, setLoggingEnabled, storage } from "./utils";
import { initOta } from "./utils/ota-updates.utils";
import { OFFLINE_CONFIG, STORAGE_KEYS } from "./constants";
import { AppContent } from "./components/app";

import { PinProvider, CacheSettingsProvider } from "./contexts";

import * as Notifications from "expo-notifications";

const previousErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  void logger.error("Unhandled JS error", {
    message: error?.message,
    stack: error?.stack,
    isFatal,
  });
  previousErrorHandler?.(error, isFatal);
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);

  useEffect(() => {
    (async () => {
      try {
        void initOta();
        await initI18n();

        const storedSettings = await AsyncStorage.getItem(
          STORAGE_KEYS.CACHE_SETTINGS,
        );
        let staleTime = OFFLINE_CONFIG.QUERY_STALE_TIME;
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          if (parsed.staleTime !== undefined) staleTime = parsed.staleTime;
        }

        const client = new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: staleTime === -1 ? Infinity : staleTime,
              gcTime: OFFLINE_CONFIG.QUERY_GC_TIME,
              retry: OFFLINE_CONFIG.QUERY_RETRY,
              refetchOnReconnect: OFFLINE_CONFIG.QUERY_REFETCH_ON_RECONNECT,
              refetchOnWindowFocus:
                OFFLINE_CONFIG.QUERY_REFETCH_ON_WINDOW_FOCUS,
            },
          },
        });
        setQueryClient(client);

        const asyncStoragePersister = createAsyncStoragePersister({
          storage: AsyncStorage,
          key: OFFLINE_CONFIG.PERSIST_KEY,
          throttleTime: OFFLINE_CONFIG.PERSIST_THROTTLE,
        });

        const [, restorePromise] = persistQueryClient({
          queryClient: client,
          persister: asyncStoragePersister,
          maxAge: OFFLINE_CONFIG.PERSIST_MAX_AGE,
          buster: OFFLINE_CONFIG.PERSIST_BUSTER,
        });
        await restorePromise;

        const value = await storage.getItem(STORAGE_KEYS.LOGGING_ENABLED);
        const isEnabled = value !== "false";
        setLoggingEnabled(isEnabled);
      } catch (e) {
        await logger.error("Bootstrap failed", {
          error: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
        });
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  if (!isReady || !queryClient) return null;

  return (
    <CacheSettingsProvider>
      <PinProvider>
        <AppContent queryClient={queryClient} />
        <Toast />
      </PinProvider>
    </CacheSettingsProvider>
  );
};

export default App;
