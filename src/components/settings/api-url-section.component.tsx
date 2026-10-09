import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import { ModalWrapper } from "../common";
import { SettingsItem } from "./settings-item.component";
import {
  getApiUrl,
  setApiUrl,
  saveApiUrl,
  getApiUrlPresets,
  subscribeApiUrl,
  isCustomApiUrlAllowed,
  type ApiUrlPreset,
} from "../../config/api-url";

export const ApiUrlSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const queryClient = useQueryClient();

  const [currentUrl, setCurrentUrl] = useState(getApiUrl());
  const [modalVisible, setModalVisible] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => subscribeApiUrl(setCurrentUrl), []);

  const presets = getApiUrlPresets();
  const customAllowed = isCustomApiUrlAllowed();

  const applyUrl = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (trimmed === currentUrl) {
      setModalVisible(false);
      return;
    }

    await saveApiUrl(trimmed);
    setApiUrl(trimmed);
    queryClient.clear();

    setModalVisible(false);
    setCustomUrl("");

    Toast.show({
      type: "success",
      text1: t("apiUrl.changed"),
      position: "bottom",
      visibilityTime: 2500,
    });
  };

  const handleApplyCustom = () => {
    if (!customAllowed) return;
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      Alert.alert(t("common.error"), t("apiUrl.invalid"));
      return;
    }
    void applyUrl(trimmed);
  };

  const presetLabel = (preset: ApiUrlPreset) =>
    t(preset.titleKey, preset.titleArgs as never);

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.apiUrl")}</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="cloud"
            label={t("apiUrl.current")}
            onPress={() => setModalVisible(true)}
            rightElement={
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {currentUrl.replace(/^https?:\/\//, "")}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
            }
          />
        </View>
      </View>

      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t("settings.apiUrl")}
        showCancel={false}
      >
        <ScrollView style={styles.presetList}>
          {presets.map((preset) => {
            const active = currentUrl === preset.url;
            return (
              <TouchableOpacity
                key={preset.url}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => void applyUrl(preset.url)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionTitle,
                      active && styles.optionTitleActive,
                    ]}
                  >
                    {presetLabel(preset)}
                  </Text>
                  <Text style={styles.optionUrl} numberOfLines={1}>
                    {preset.url}
                  </Text>
                </View>
                {active && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {customAllowed && (
          <View style={styles.customBlock}>
            <Text style={styles.customLabel}>{t("apiUrl.custom")}</Text>
            <TextInput
              style={styles.customInput}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder={t("apiUrl.customPlaceholder")}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                !customUrl.trim() && styles.applyButtonDisabled,
              ]}
              onPress={handleApplyCustom}
              disabled={!customUrl.trim()}
            >
              <Text style={styles.applyButtonText}>{t("apiUrl.apply")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ModalWrapper>
    </>
  );
};

const getStyles = createStyles((colors) => ({
  section: { marginBottom: 24 },
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 200,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  presetList: {
    maxHeight: 320,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  optionActive: {
    borderColor: colors.primary,
  },
  optionContent: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },
  optionTitleActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  optionUrl: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  customBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  customLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  customInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  applyButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
}));
