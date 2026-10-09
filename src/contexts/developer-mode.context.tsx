import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type FC,
} from "react";

import { storage } from "../utils/storage.utils";
import { STORAGE_KEYS } from "../constants";

interface DeveloperModeContextType {
  /** Показывать ли скрытые секции настроек. */
  isDeveloperMode: boolean;
  setDeveloperMode: (enabled: boolean) => Promise<void>;
  toggleDeveloperMode: () => Promise<void>;
}

const DeveloperModeContext = createContext<
  DeveloperModeContextType | undefined
>(undefined);

/**
 * Режим разработчика.
 *
 * Это именно UI-флаг: он не разблокирует кастомный API URL (это разрешено
 * только в `__DEV__` сборке), а лишь показывает/прячет отладочные секции
 * в настройках. Включается долгим тапом по версии приложения в футере
 * настроек, выключается через тот же тап + подтверждение.
 */
export const DeveloperModeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.getItem(STORAGE_KEYS.DEVELOPER_MODE);
        setIsDeveloperMode(stored === "true" || __DEV__);
      } catch {}
    })();
  }, []);

  const setDeveloperMode = useCallback(async (enabled: boolean) => {
    try {
      await storage.setItem(STORAGE_KEYS.DEVELOPER_MODE, String(enabled));
    } catch {}
    setIsDeveloperMode(enabled);
  }, []);

  const toggleDeveloperMode = useCallback(async () => {
    await setDeveloperMode(!isDeveloperMode);
  }, [isDeveloperMode, setDeveloperMode]);

  return (
    <DeveloperModeContext.Provider
      value={{ isDeveloperMode, setDeveloperMode, toggleDeveloperMode }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
};

export const useDeveloperMode = (): DeveloperModeContextType => {
  const ctx = useContext(DeveloperModeContext);
  if (!ctx) {
    throw new Error(
      "useDeveloperMode must be used within DeveloperModeProvider",
    );
  }
  return ctx;
};
