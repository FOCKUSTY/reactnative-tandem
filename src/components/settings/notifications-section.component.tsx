import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "../../contexts/auth.context";
import { pushService } from "../../api/services/push.service";
import { useTranslate } from "../../hooks/i18n/use-translation.hook";
import { useTheme } from "../../contexts/theme.context";
import { createStyles } from "../../utils";
import { SettingsItem } from "./settings-item.component";

export const NotificationsSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const { user } = useAuth();

  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkPermissions();
    }
  }, [user]);

  const checkPermissions = async () => {
    const status = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const handleSetup = async () => {
    if (!user) {
      Alert.alert(t("common.error"), "Пользователь не авторизован");
      return;
    }

    setLoading(true);
    try {
      let status = await Notifications.getPermissionsAsync();
      if (!status.granted) {
        status = await Notifications.requestPermissionsAsync();
      }

      if (!status.granted) {
        Alert.alert(t("common.error"), t("notifications.permissionDenied"));
        setPermissionStatus(status);
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      await pushService.registerToken(token);

      setPermissionStatus(status);
      Alert.alert(t("common.success"), t("notifications.success"));
    } catch (error) {
      console.error("Error setting up notifications:", error);
      Alert.alert(t("common.error"), t("notifications.error"));
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = permissionStatus?.granted === true;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("notifications.title")}</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="notifications"
          label={t("notifications.status")}
          rightElement={
            <Text
              style={[
                styles.statusText,
                isEnabled ? styles.enabledText : styles.disabledText,
              ]}
            >
              {isEnabled
                ? t("notifications.enabled")
                : t("notifications.disabled")}
            </Text>
          }
        />
        <TouchableOpacity
          style={[styles.setupButton, loading && styles.disabledButton]}
          onPress={handleSetup}
          disabled={loading}
        >
          <Text style={styles.setupButtonText}>
            {loading
              ? t("common.loading")
              : isEnabled
                ? t("notifications.refresh")
                : t("notifications.setup")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  enabledText: {
    color: colors.success,
  },
  disabledText: {
    color: colors.danger,
  },
  setupButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  setupButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
}));
