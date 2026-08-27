import { Alert } from "react-native";
import { useAuth, useTheme } from "../contexts";

export const useSettings = () => {
  const { user, me, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      { text: "Отмена", style: "cancel" },
      { text: "Выйти", style: "destructive", onPress: logout },
    ]);
  };

  const isPartnerLinked = !!me?.pair;

  return {
    user,
    me,
    mode,
    toggleTheme,
    handleLogout,
    isPartnerLinked,
  };
};
