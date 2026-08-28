import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState } from "react";

import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import { ModalWrapper } from "../common";
import { SettingsItem } from "./settings-item.component";

import { changeLanguage, SUPPORTED_LANGUAGES_AND_SYSTEM } from "../../i18n";

export const LanguageSection = () => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslate();
  const styles = getStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = i18n.language;

  const languageNames: Record<string, string> = {
    ru: t("languages.ru"),
    en: t("languages.en"),
    system: t("languages.system"),
  };

  const handleSelectLanguage = async (language: string) => {
    await changeLanguage(language as any);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
        <View style={styles.card}>
          <SettingsItem
            icon="language"
            label={t("settings.language")}
            onPress={() => setModalVisible(true)}
            rightElement={
              <View style={styles.languageBadge}>
                <Text style={styles.languageText}>
                  {languageNames[currentLanguage] || currentLanguage}
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
        title={t("settings.language")}
        showCancel={false}
      >
        <FlatList
          data={SUPPORTED_LANGUAGES_AND_SYSTEM}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.languageOption,
                currentLanguage === item && styles.languageOptionActive,
              ]}
              onPress={() => handleSelectLanguage(item)}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  currentLanguage === item && styles.languageOptionTextActive,
                ]}
              >
                {languageNames[item] || item}
              </Text>
              {currentLanguage === item && (
                <MaterialIcons name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.languageList}
        />
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
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  languageText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  languageList: {
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  languageOptionActive: {
    backgroundColor: colors.inputBackground,
  },
  languageOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  languageOptionTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
}));
