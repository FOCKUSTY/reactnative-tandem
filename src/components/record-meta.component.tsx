import { View, Text } from "react-native";
import { useTheme } from "../contexts";
import { createStyles } from "../utils";

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
  const styles = getStyles(colors);

  return (
    <View style={styles.metaContainer}>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Статус:</Text>
        <Text style={[styles.metaValue, isCompleted && styles.completed]}>
          {isCompleted ? "✅ Выполнено" : "⏳ В процессе"}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Закреплено:</Text>
        <Text style={styles.metaValue}>{isPinned ? "📌 Да" : "Нет"}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Создано:</Text>
        <Text style={styles.metaValue}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Обновлено:</Text>
        <Text style={styles.metaValue}>
          {new Date(updatedAt).toLocaleString()}
        </Text>
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
