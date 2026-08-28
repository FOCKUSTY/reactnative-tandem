import { View, Text, Switch } from "react-native";
import { ThemeMode } from "../../constants";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";
import { useTranslate } from "../../hooks";

import { SettingsItem } from "./settings-item.component";

export type AppearanceSectionProps = {
  mode: ThemeMode;
  onToggleTheme: () => void;
};

export const AppearanceSection = ({
  mode,
  onToggleTheme,
}: AppearanceSectionProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("settings.appearance")}</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="dark-mode"
          label={t("settings.darkTheme")}
          rightElement={
            <Switch
              value={mode === "dark"}
              onValueChange={onToggleTheme}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
          }
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
