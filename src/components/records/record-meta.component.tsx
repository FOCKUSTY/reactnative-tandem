import { View, Text } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles, formatDateTime } from "../../utils";
import { useTranslate } from "../../hooks";

export type RecordMetaProperties = {
  isCompleted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export const RecordMeta = ({
  isCompleted,
  isPinned,
  createdAt,
  updatedAt,
}: RecordMetaProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.metaContainer}>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t("records.meta.status")}</Text>
        <Text style={[styles.metaValue, isCompleted && styles.completed]}>
          {isCompleted
            ? t("records.meta.completed")
            : t("records.meta.inProgress")}
        </Text>
      </View>
      {isPinned && (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t("records.meta.pinned")}</Text>
          <Text style={styles.metaValue}>{t("records.meta.yes")}</Text>
        </View>
      )}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t("records.meta.createdAt")}</Text>
        <Text style={styles.metaValue}>{formatDateTime(createdAt)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t("records.meta.updatedAt")}</Text>
        <Text style={styles.metaValue}>{formatDateTime(updatedAt)}</Text>
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  completed: {
    color: colors.success,
  },
}));
