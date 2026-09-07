import type { MyRecord, NavigationProperty } from "../../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { createStyles, formatDateTime, formatIntervalLabel } from "../../utils";
import { useTheme } from "../../contexts";
import { useTranslate } from "../../hooks";

export type RecordCardProps = {
  record: MyRecord;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
};

export const RecordCard = ({
  record,
  onDelete,
  showDelete = false,
}: RecordCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  const handlePress = () => {
    navigation.navigate("RecordDetail", { id: record.id });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {record.title || t("records.untitled")}
        </Text>
        {showDelete && onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(record.id)}
            style={styles.deleteButton}
          >
            <MaterialIcons
              name="delete-outline"
              size={22}
              color={colors.danger}
            />
          </TouchableOpacity>
        )}
      </View>

      {record.dateEvent && (
        <Text style={styles.date}>📅 {formatDateTime(record.dateEvent)}</Text>
      )}

      {record.content && (
        <Text style={styles.content} numberOfLines={2}>
          {record.content}
        </Text>
      )}

      {record.isRecurring && record.recurringInterval && (
        <View style={styles.recurringBadge}>
          <MaterialIcons name="repeat" size={14} color={colors.primary} />
          <Text style={styles.recurringText}>
            {formatIntervalLabel(record.recurringInterval)}
          </Text>
        </View>
      )}

      <View style={styles.tags}>
        {record.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
        {record.tags.length > 3 && (
          <Text style={styles.tagMore}>+{record.tags.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = createStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  date: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagMore: {
    fontSize: 12,
    color: colors.textMuted,
    alignSelf: "center",
    marginLeft: 4,
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  recurringText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
}));
