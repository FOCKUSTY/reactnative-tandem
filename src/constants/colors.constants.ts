export const LIGHT = {
  background: "#F5F5F5",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "#E0E0E0",
  text: "#1A1A1A",
  textSecondary: "#555555",
  textMuted: "#888888",
  primary: "#007AFF",
  primaryDark: "#0056B3",
  success: "#34C759",
  danger: "#FF3B30",
  bannerBackground: "#E3F2FD",
  bannerBorder: "#BBDEFB",
  bannerText: "#0D47A1",
  inputBackground: "#F0F0F0",
  inputBorder: "#CCCCCC",
  scrollBackground: "#F0F0F0",
};

export const DARK = {
  background: "#121212",
  surface: "#1E1E1E",
  card: "#2A2A2A",
  cardBorder: "#3A3A3A",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textMuted: "#6A6A6A",
  primary: "#4A90D9",
  primaryDark: "#3A7BC8",
  success: "#34C759",
  danger: "#FF3B30",
  bannerBackground: "#1C3A5A",
  bannerBorder: "#2A4A6A",
  bannerText: "#8BB8E8",
  inputBackground: "#333333",
  inputBorder: "#444444",
  scrollBackground: "#2A2A2A",
};

export type ThemeColors = typeof LIGHT;
export type ThemeMode = "light" | "dark";

export const getColors = (mode: ThemeMode): ThemeColors => {
  return mode === "dark" ? DARK : LIGHT;
};
