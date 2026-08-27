import { View, Text, TouchableOpacity } from "react-native";
import { ThemeColors } from "../constants";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";

export type SortField = "dateEvent" | "createdAt" | "updatedAt" | "title";
export type SortOrder = "asc" | "desc";

export type SortControlsProperties = {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortByChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
};

export const SortControls = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortControlsProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const fields: { value: SortField; label: string }[] = [
    { value: "dateEvent", label: "Дата" },
    { value: "createdAt", label: "Создано" },
    { value: "title", label: "Заголовок" },
  ];

  return (
    <View>
      <Text style={styles.label}>Сортировка</Text>
      <View style={styles.sortRow}>
        {fields.map((field) => (
          <TouchableOpacity
            key={field.value}
            style={[
              styles.sortButton,
              sortBy === field.value && styles.sortButtonActive,
            ]}
            onPress={() => onSortByChange(field.value)}
          >
            <Text style={styles.sortButtonText}>{field.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.sortRow}>
        {(["asc", "desc"] as const).map((order) => (
          <TouchableOpacity
            key={order}
            style={[
              styles.sortButton,
              sortOrder === order && styles.sortButtonActive,
            ]}
            onPress={() => onSortOrderChange(order)}
          >
            <Text style={styles.sortButtonText}>
              {order === "asc" ? "По возрастанию" : "По убыванию"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const getStyles = createStyles((colors: ThemeColors) => ({
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    color: colors.text,
    fontSize: 14,
  },
}));
