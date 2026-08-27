import { TextStyle, ViewStyle } from "react-native";
import { ThemeColors } from "../constants";

export type CommonStyles = ReturnType<typeof commonStyles>;

export const commonStyles = (colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  field: {
    marginBottom: 16,
  } as ViewStyle,

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  } as TextStyle,

  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
  } as TextStyle,

  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  } as ViewStyle,

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  } as TextStyle,

  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  } as ViewStyle,
});
