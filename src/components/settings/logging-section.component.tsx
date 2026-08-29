import { View, Text, Switch } from "react-native";
import { useState, useEffect } from "react";

import { createStyles, setLoggingEnabled, storage } from "../../utils";
import { STORAGE_KEYS } from "../../constants";
import { useTranslate } from "../../hooks";
import { useTheme } from "../../contexts";
import { useNavigation } from "@react-navigation/native";
import { NavigationProperty } from "../../types";
import { SettingsItem } from "./settings-item.component";

export const LoggingSection = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const [enabled, setEnabled] = useState(true);

  const navigation = useNavigation<NavigationProperty>();

  useEffect(() => {
    (async () => {
      const value = await storage.getItem(STORAGE_KEYS.LOGGING_ENABLED);
      const enabled = value !== "false";
      setEnabled(enabled);
      setLoggingEnabled(enabled);
    })();
  }, []);

  const toggle = async (value: boolean) => {
    setEnabled(value);
    await storage.setItem(STORAGE_KEYS.LOGGING_ENABLED, String(value));
    setLoggingEnabled(value);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("settings.logging")}</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="report-problem"
          label={t("settings.logging")}
          rightElement={
            <Switch
              value={enabled}
              onValueChange={toggle}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
          }
        />
        <SettingsItem
          icon="bug-report"
          label={t("settings.logs")}
          onPress={() => navigation.navigate("Logs")}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: colors.text,
  },
}));
