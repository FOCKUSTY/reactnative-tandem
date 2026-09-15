import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import * as Notifications from "expo-notifications";
import { useReminder, useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import { SettingsItem } from "./settings-item.component";
import { ModalWrapper } from "../common";
import { useNavigation } from "@react-navigation/native";
import { NavigationProperty } from "../../types";
import { TranslationInput } from "../../i18n";

export const NotificationsSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const { offsets, updateOffsets } = useReminder();

  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customOffsetText, setCustomOffsetText] = useState("");

  const navigation = useNavigation<NavigationProperty>();

  const PRESET_OFFSETS: { value: number; key: TranslationInput }[] = [
    { value: 0, key: "reminders.offset.now" },
    { value: 30, key: "reminders.offset.30min" },
    { value: 60, key: "reminders.offset.1hour" },
    { value: 120, key: "reminders.offset.2hours" },
    { value: 360, key: "reminders.offset.6hours" },
    { value: 720, key: "reminders.offset.12hours" },
    { value: 1440, key: "reminders.offset.1day" },
    { value: 2880, key: "reminders.offset.2days" },
  ];

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const status = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const handleRequestPermissions = async () => {
    setLoading(true);
    try {
      let status = await Notifications.getPermissionsAsync();
      if (!status.granted) {
        status = await Notifications.requestPermissionsAsync();
      }

      setPermissionStatus(status);
      if (!status.granted) {
        Alert.alert(t("common.error"), t("notifications.permissionDenied"));
      } else {
        Alert.alert(t("common.success"), t("notifications.success"));
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert(t("common.error"), t("notifications.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOffset = (value: number) => {
    if (offsets.includes(value)) {
      updateOffsets(offsets.filter((v) => v !== value));
    } else {
      updateOffsets([...offsets, value]);
    }
  };

  const handleCustomOffset = () => {
    const value = parseInt(customOffsetText, 10);
    if (!isNaN(value) && value >= 0) {
      if (!offsets.includes(value)) {
        updateOffsets([...offsets, value]);
      }
      setCustomModalVisible(false);
      setCustomOffsetText("");
    } else {
      Alert.alert(t("common.error"), "Введите неотрицательное число минут");
    }
  };

  const removeCustomOffset = (value: number) => {
    if (!PRESET_OFFSETS.some((p) => p.value === value)) {
      updateOffsets(offsets.filter((v) => v !== value));
    }
  };

  const formatOffsetLabel = (minutes: number) => {
    if (minutes === 0) return "В момент";
    if (minutes < 60) return `${minutes} мин`;
    if (minutes === 60) return "1 час";
    if (minutes === 120) return "2 часа";
    if (minutes % 60 === 0) return `${minutes / 60} часов`;
    return `${minutes} мин`;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("settings.notifications")}</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="notifications"
          label={t("notifications.status")}
          rightElement={
            <Text
              style={[
                styles.statusText,
                permissionStatus?.granted
                  ? styles.enabledText
                  : styles.disabledText,
              ]}
            >
              {permissionStatus?.granted
                ? t("notifications.enabled")
                : t("notifications.disabled")}
            </Text>
          }
        />

        <TouchableOpacity
          style={[styles.setupButton, loading && styles.disabledButton]}
          onPress={handleRequestPermissions}
          disabled={loading}
        >
          <Text style={styles.setupButtonText}>
            {loading
              ? t("common.loading")
              : permissionStatus?.granted
                ? t("notifications.refresh")
                : t("notifications.setup")}
          </Text>
        </TouchableOpacity>

        <View style={styles.reminderBlock}>
          <Text style={styles.reminderLabel}>
            {t("notifications.reminderOffset")}
          </Text>
          <View style={styles.optionsRow}>
            {PRESET_OFFSETS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionButton,
                  offsets.includes(opt.value) && styles.optionButtonActive,
                ]}
                onPress={() => handleToggleOffset(opt.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    offsets.includes(opt.value) && styles.optionTextActive,
                  ]}
                >
                  {t(opt.key)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setCustomModalVisible(true)}
            >
              <Text style={styles.optionText}>+ Другое</Text>
            </TouchableOpacity>
          </View>
          {offsets.filter((o) => !PRESET_OFFSETS.some((p) => p.value === o))
            .length > 0 && (
            <View style={styles.customList}>
              <Text style={styles.customLabel}>Пользовательские:</Text>
              {offsets
                .filter(
                  (offset) =>
                    !PRESET_OFFSETS.some((preset) => preset.value === offset),
                )
                .map((offset) => (
                  <TouchableOpacity
                    key={offset}
                    style={styles.customChip}
                    onPress={() => removeCustomOffset(offset)}
                  >
                    <Text style={styles.customChipText}>
                      {formatOffsetLabel(offset)} ✕
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </View>

      <SettingsItem
        icon="list"
        label="Посмотреть все напоминания"
        onPress={() => navigation.navigate("Reminders")}
      />

      <ModalWrapper
        visible={customModalVisible}
        onClose={() => {
          setCustomModalVisible(false);
          setCustomOffsetText("");
        }}
        title="Введите смещение (в минутах)"
        confirmText="Добавить"
        onConfirm={handleCustomOffset}
      >
        <TextInput
          style={styles.input}
          placeholder="Например: 90"
          keyboardType="number-pad"
          value={customOffsetText}
          onChangeText={setCustomOffsetText}
        />
      </ModalWrapper>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  setupButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  reminderBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
    marginTop: 4,
  },
  reminderLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  optionTextActive: {
    color: "#fff",
  },
  customList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  customLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginRight: 8,
    alignSelf: "center",
  },
  customChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  customChipText: {
    fontSize: 14,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
}));
