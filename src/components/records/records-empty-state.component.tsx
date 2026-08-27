import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";

export type RecordsEmptyStateProperties = {
  onCreate: () => void;
};

export const RecordsEmptyState = ({
  onCreate,
}: RecordsEmptyStateProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.centered}>
      <MaterialIcons name="inbox" size={64} color={colors.textMuted} />
      <Text style={styles.emptyText}>Нет записей в этом разделе</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onCreate}>
        <Text style={styles.emptyButtonText}>Создать первую запись</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
}));
