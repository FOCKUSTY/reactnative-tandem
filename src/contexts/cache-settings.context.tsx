import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OFFLINE_CONFIG } from "../constants/offline.constants";

export type StaleTimeOption = number | -1; // -1 = Infinity

export const STALE_TIME_PRESETS: { label: string; value: StaleTimeOption }[] = [
  { label: "Без кэша", value: 0 },
  { label: "5 минут", value: 5 * 60 * 1000 },
  { label: "15 минут", value: 15 * 60 * 1000 },
  { label: "1 час", value: 60 * 60 * 1000 },
  { label: "24 часа", value: 24 * 60 * 60 * 1000 },
  { label: "Никогда (только кэш)", value: -1 },
];

interface CacheSettings {
  staleTime: StaleTimeOption;
  offlineMode: boolean;
}

const DEFAULT_SETTINGS: CacheSettings = {
  staleTime: OFFLINE_CONFIG.QUERY_STALE_TIME,
  offlineMode: true,
};

const STORAGE_KEY = ".cache_settings";

interface CacheSettingsContextType {
  settings: CacheSettings;
  updateSettings: (newSettings: Partial<CacheSettings>) => Promise<void>;
}

const CacheSettingsContext = createContext<
  CacheSettingsContextType | undefined
>(undefined);

export const CacheSettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<CacheSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch (error) {
      console.warn("Failed to load cache settings", error);
    }
  };

  const updateSettings = async (newSettings: Partial<CacheSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  };

  return (
    <CacheSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </CacheSettingsContext.Provider>
  );
};

export const useCacheSettings = () => {
  const context = useContext(CacheSettingsContext);
  if (!context)
    throw new Error(
      "useCacheSettings must be used within CacheSettingsProvider",
    );
  return context;
};
