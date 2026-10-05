import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import type { NavigationProperty } from "../../types";

import { SettingsItem } from "./settings-item.component";

export const TemplateHelpSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("templateHelp.sectionTitle")}</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="help-outline"
          label={t("templateHelp.open")}
          onPress={() => navigation.navigate("TemplateHelp")}
        />
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
}));
