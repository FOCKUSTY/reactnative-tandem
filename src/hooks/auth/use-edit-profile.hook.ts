import { useState } from "react";
import { Alert } from "react-native";

import { useAuth } from "../../contexts";
import { usersService } from "../../api";
import { handleApiError } from "../../utils";
import { useTranslate } from "../i18n";

export const useEditProfile = () => {
  const { t } = useTranslate();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      Alert.alert(t("common.error"), t("auth.errors.nameRequired"));
      return;
    }
    if (!trimmedUsername) {
      Alert.alert(t("common.error"), t("auth.errors.usernameRequired"));
      return;
    }

    const hasChanges =
      trimmedName !== user?.name || trimmedUsername !== user?.username;
    if (!hasChanges) {
      Alert.alert(t("common.error"), t("profile.noChanges"));
      return;
    }

    setLoading(true);
    const payload: { name?: string; username?: string } = {};
    if (trimmedName !== user?.name) payload.name = trimmedName;
    if (trimmedUsername !== user?.username) payload.username = trimmedUsername;

    const result = await updateProfile(payload);
    setLoading(false);

    if (!result.success) {
      Alert.alert(
        t("common.error"),
        result.message || t("profile.updateFailed"),
      );
      return;
    }
    Alert.alert(t("common.success"), t("profile.updateSuccess"));
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert(
        t("common.error"),
        t("profile.errors.currentPasswordRequired"),
      );
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

    setPasswordLoading(true);
    try {
      await usersService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert(t("common.success"), t("profile.passwordChanged"));
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert(
        t("common.error"),
        apiError.message || t("profile.errors.changeFailed"),
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return {
    name,
    setName,
    username,
    setUsername,
    loading,
    handleSaveProfile,

    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    handleChangePassword,
  };
};
