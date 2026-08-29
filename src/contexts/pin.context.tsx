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
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isPinEnabled, setIsPinEnabledState] = useState(false);

  useEffect(() => {
    const load = async () => {
      const enabled = await storage.getItem(STORAGE_KEYS.PIN_ENABLED);
      setIsPinEnabledState(enabled === "true");
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

  const verifyPin = async (input: string): Promise<boolean> => {
    const stored = await getStoredPin();
    if (!stored) return false;
    const hash = await hashPin(input);
    return hash === stored;
  };

  const setPin = async (newPin: string) => {
    const hash = await hashPin(newPin);
    await storage.setItem(STORAGE_KEYS.PIN_CODE, hash);
    await setIsPinEnabled(true);
  };

  const removePin = async () => {
    await storage.deleteItem(STORAGE_KEYS.PIN_CODE);
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
