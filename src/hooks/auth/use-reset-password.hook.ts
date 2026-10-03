import { useState } from "react";
import { Alert } from "react-native";

import { authService } from "../../api";
import { handleApiError } from "../../utils";
import { useTranslate } from "../i18n";

export const useResetPassword = (token?: string) => {
  const { t } = useTranslate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert(t("common.error"), t("auth.resetTokenMissing"));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t("common.error"), t("auth.errors.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setDone(true);
      Alert.alert(t("common.success"), t("auth.resetSuccess"));
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert(
        t("common.error"),
        apiError.message || t("auth.errors.resetFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    done,
    handleSubmit,
  };
};
