import { useState } from "react";
import { Alert } from "react-native";

import { authService } from "../../api";
import { handleApiError } from "../../utils";
import { useTranslate } from "../i18n";

export const useForgotPassword = () => {
  const { t } = useTranslate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert(t("common.error"), t("auth.errors.emailRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      Alert.alert(t("common.error"), t("auth.errors.emailInvalid"));
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(trimmed);
      setSent(true);
      Alert.alert(t("common.success"), t("auth.forgotSuccess"));
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert(
        t("common.error"),
        apiError.message || t("auth.errors.forgotFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    sent,
    handleSubmit,
  };
};
