import type { MaterialIconsIconName } from "@react-native-vector-icons/material-icons";
import type { Section } from "../../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

const SECTION_ICONS: Record<string, MaterialIconsIconName> = {
  rules: "rule",
  dates: "event",
  plans: "assignment",
  notes: "note",
  questions: "help",
  contacts: "contacts",
  definitions: "book",
  discasses: "chat",
  fanfics: "history-edu",
};

export type SectionCardProps = {
  section: Section;
  onPress: (section: Section) => void;
  onLongPress: (section: Section) => void;
};

export const SectionCard = ({
  section,
  onPress,
  onLongPress,
}: SectionCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const getIcon = (section: Section): MaterialIconsIconName => {
    if (section.isSystem && SECTION_ICONS[section.slug]) {
      return SECTION_ICONS[section.slug];
    }
    return "folder";
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(section)}
      onLongPress={() => onLongPress(section)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={getIcon(section)}
          size={32}
          color={colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{section.name}</Text>
        <Text style={styles.count}>
          {t("sections.recordsCount", { count: section._count?.records || 0 })}
        </Text>
      </View>
      {section.isSystem && (
        <View style={styles.systemBadge}>
          <Text style={styles.systemBadgeText}>{t("sections.system")}</Text>
        </View>
      )}
      <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const getStyles = createStyles((colors) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  systemBadge: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  systemBadgeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
}));
