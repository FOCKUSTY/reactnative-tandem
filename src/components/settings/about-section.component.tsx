import { View, Text } from "react-native";

import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import { useTheme } from "../../contexts";
import { VERSION } from "../../constants";

import { SettingsItem } from "./settings-item.component";

export const AboutSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="info"
          label={t("settings.version")}
          rightElement={<Text style={styles.valueText}>{VERSION}</Text>}
        />
        <SettingsItem
          icon="monitor-heart"
          label={t("settings.madeWithLove")}
          rightElement={<Text style={styles.valueText}>❤️</Text>}
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
  valueText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
}));
