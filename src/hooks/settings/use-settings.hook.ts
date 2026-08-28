import { Alert } from "react-native";
import { useAuth, useTheme } from "../../contexts";
import { useTranslate } from "../i18n";

export const useSettings = () => {
  const { t } = useTranslate();
  const { user, me, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      t("settings.logoutConfirm.title"),
      t("settings.logoutConfirm.message"),
      [
        { text: t("settings.logoutConfirm.cancel"), style: "cancel" },
        {
          text: t("settings.logoutConfirm.confirm"),
          style: "destructive",
          onPress: logout,
        },
      ],
    );
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
