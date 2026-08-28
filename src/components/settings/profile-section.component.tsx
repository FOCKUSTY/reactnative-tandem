import type { User } from "../../types";

import { View, Text } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

import { SettingsItem } from "./settings-item.component";

export type ProfileSectionProps = {
  user: User | null;
};

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("settings.profile")}</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="verified-user"
          label={user?.name || user?.username || t("settings.user")}
          rightElement={<Text style={styles.valueText}>{user?.username}</Text>}
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
