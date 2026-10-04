import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  FC,
} from "react";
import { storage } from "../utils/storage.utils";
import { STORAGE_KEYS } from "../constants";
import * as Crypto from "expo-crypto";

interface PinContextType {
  isPinEnabled: boolean;
  setIsPinEnabled: (enabled: boolean) => Promise<void>;
  verifyPin: (input: string) => Promise<boolean>;
  setPin: (newPin: string) => Promise<void>;
  removePin: () => Promise<void>;
  checkPin: () => Promise<boolean>;
  /** Время (ms epoch), до которого ввод PIN заблокирован, либо null. */
  lockedUntil: number | null;
}

/**
 * Защита от подбора PIN.
 *
 * 4 цифры — это 10 000 комбинаций, которые перебираются за секунды, если не
 * ограничивать попытки. После MAX_FAILED_ATTEMPTS промахов ввод блокируется
 * на LOCK_DURATION_MS; счётчик сбрасывается при успешном вводе.
 */
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isPinEnabled, setIsPinEnabledState] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const enabled = await storage.getItem(STORAGE_KEYS.PIN_ENABLED);
      setIsPinEnabledState(enabled === "true");
      const untilRaw = await storage.getItem(STORAGE_KEYS.PIN_LOCKED_UNTIL);
      if (untilRaw) {
        const until = Number(untilRaw);
        if (Number.isFinite(until) && until > Date.now()) {
          setLockedUntil(until);
        } else {
          await storage.deleteItem(STORAGE_KEYS.PIN_LOCKED_UNTIL);
          await storage.deleteItem(STORAGE_KEYS.PIN_FAILED_ATTEMPTS);
        }
      }
    };
    load();
  }, []);

  const setIsPinEnabled = async (enabled: boolean) => {
    await storage.setItem(STORAGE_KEYS.PIN_ENABLED, String(enabled));
    setIsPinEnabledState(enabled);
  };

  const getStoredPin = async (): Promise<string | null> => {
    return await storage.getItem(STORAGE_KEYS.PIN_CODE);
  };

  const clearLock = async () => {
    setLockedUntil(null);
    await storage.deleteItem(STORAGE_KEYS.PIN_LOCKED_UNTIL);
    await storage.deleteItem(STORAGE_KEYS.PIN_FAILED_ATTEMPTS);
  };

  const registerFailure = async () => {
    const raw = await storage.getItem(STORAGE_KEYS.PIN_FAILED_ATTEMPTS);
    const attempts = (Number(raw) || 0) + 1;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const until = Date.now() + LOCK_DURATION_MS;
      await storage.setItem(STORAGE_KEYS.PIN_LOCKED_UNTIL, String(until));
      await storage.deleteItem(STORAGE_KEYS.PIN_FAILED_ATTEMPTS);
      setLockedUntil(until);
    } else {
      await storage.setItem(
        STORAGE_KEYS.PIN_FAILED_ATTEMPTS,
        String(attempts),
      );
    }
  };

  const verifyPin = async (input: string): Promise<boolean> => {
    if (lockedUntil && lockedUntil > Date.now()) {
      return false;
    }
    const stored = await getStoredPin();
    if (!stored) return false;
    const hash = await hashPin(input);
    if (hash === stored) {
      await clearLock();
      return true;
    }
    await registerFailure();
    return false;
  };

  const setPin = async (newPin: string) => {
    const hash = await hashPin(newPin);
    await storage.setItem(STORAGE_KEYS.PIN_CODE, hash);
    await clearLock();
    await setIsPinEnabled(true);
  };

  const removePin = async () => {
    await storage.deleteItem(STORAGE_KEYS.PIN_CODE);
    await clearLock();
    await setIsPinEnabled(false);
  };

  const checkPin = async (): Promise<boolean> => {
    const enabled = await storage.getItem(STORAGE_KEYS.PIN_ENABLED);
    return enabled === "true";
  };

  const hashPin = async (pin: string): Promise<string> => {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin,
    );
    return digest;
  };

  return (
    <PinContext.Provider
      value={{
        isPinEnabled,
        setIsPinEnabled,
        verifyPin,
        setPin,
        removePin,
        checkPin,
        lockedUntil,
      }}
    >
      {children}
    </PinContext.Provider>
  );
};

export const usePin = (): PinContextType => {
  const context = useContext(PinContext);
  if (!context) throw new Error("usePin must be used within PinProvider");
  return context;
};
