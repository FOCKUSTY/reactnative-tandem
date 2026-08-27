import { View, Text, Switch } from "react-native";
import { ThemeMode } from "../../constants";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";

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
  const styles = getStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Внешний вид</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="dark-mode"
          label="Тёмная тема"
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
