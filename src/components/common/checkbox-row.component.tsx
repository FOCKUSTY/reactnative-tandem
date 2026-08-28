import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

export type CheckboxRowProperties = {
  completed: boolean;
  pinned: boolean;
  onToggleCompleted: () => void;
  onTogglePinned: () => void;
};

export const CheckboxRowComponent = ({
  completed,
  pinned,
  onToggleCompleted,
  onTogglePinned,
}: CheckboxRowProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.checkboxRow}>
      <TouchableOpacity style={styles.checkboxItem} onPress={onToggleCompleted}>
        <MaterialIcons
          name={completed ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={colors.primary}
        />
        <Text style={styles.checkboxLabel}>{t("records.field.completed")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.checkboxItem} onPress={onTogglePinned}>
        <MaterialIcons
          name={pinned ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={colors.primary}
        />
        <Text style={styles.checkboxLabel}>{t("records.field.pinned")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  checkboxRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  checkboxLabel: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 6,
  },
}));
