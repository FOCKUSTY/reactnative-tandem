import type { Table } from "../../types/table.types";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

type TableCardProps = {
  table: Table;
  onPress: (table: Table) => void;
  onLongPress?: (table: Table) => void;
};

export const TableCard = ({ table, onPress, onLongPress }: TableCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(table)}
      onLongPress={() => onLongPress?.(table)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="table-rows" size={28} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{table.name}</Text>
        {table.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {table.description}
          </Text>
        ) : null}
        <Text style={styles.count}>
          {table._count?.rows || 0}{" "}
          {t("sections.recordsCount", { count: table._count?.rows || 0 })}
        </Text>
      </View>
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
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  count: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
}));
