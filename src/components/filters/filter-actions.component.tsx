import { View, TouchableOpacity, Text } from "react-native";
import { ThemeColors } from "../../constants";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";
import { useTranslate } from "../../hooks";

export type FilterActionsProps = {
  onClear: () => void;
  onApply: () => void;
};

export const FilterActions = ({ onClear, onApply }: FilterActionsProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={onClear}
      >
        <Text style={styles.buttonText}>{t("filters.reset")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.applyButton]}
        onPress={onApply}
      >
        <Text style={styles.buttonText}>{t("filters.apply")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createStyles((colors: ThemeColors) => ({
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
}));
