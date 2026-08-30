import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState } from "react";
import { useTheme, useCacheSettings, STALE_TIME_PRESETS } from "../../contexts";
import { useTranslate } from "../../hooks";
import { createStyles } from "../../utils";
import { SettingsItem } from "./settings-item.component";
import { ModalWrapper } from "../common";

export const CacheSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const { settings, updateSettings } = useCacheSettings();
  const [modalVisible, setModalVisible] = useState(false);

  const currentStaleTimeLabel =
    STALE_TIME_PRESETS.find((p) => p.value === settings.staleTime)?.label ||
    "5 минут";

  const handleSelectStaleTime = async (value: number) => {
    await updateSettings({ staleTime: value as any });
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.cache")}</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="timer"
            label={t("settings.cacheStaleTime")}
            onPress={() => setModalVisible(true)}
            rightElement={
              <View style={styles.rightBadge}>
                <Text style={styles.rightBadgeText}>
                  {currentStaleTimeLabel}
                </Text>
              </View>
            }
          />
        </View>
      </View>

      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t("settings.cacheStaleTime")}
        showCancel={false}
      >
        {STALE_TIME_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.value}
            style={[
              styles.option,
              settings.staleTime === preset.value && styles.optionActive,
            ]}
            onPress={() => handleSelectStaleTime(preset.value)}
          >
            <Text
              style={[
                styles.optionText,
                settings.staleTime === preset.value && styles.optionTextActive,
              ]}
            >
              {preset.label}
            </Text>
            {settings.staleTime === preset.value && (
              <MaterialIcons name="check" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ModalWrapper>
    </>
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
  rightBadge: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rightBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  optionActive: {
    backgroundColor: colors.inputBackground,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
}));
