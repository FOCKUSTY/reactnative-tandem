import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { storage } from "../utils/storage.utils";
import {
  ThemeMode,
  getColors,
  ThemeColors,
} from "../constants/colors.constants";

const STORAGE_KEY = ".theme_mode";

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await storage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        setMode(saved);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    storage.setItem(STORAGE_KEY, newMode);
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    storage.setItem(STORAGE_KEY, newMode);
  };

  const colors = getColors(mode);

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
