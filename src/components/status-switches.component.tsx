import { View, Text, Switch } from "react-native";
import { useTheme } from "../contexts";
import { ThemeColors } from "../constants";
import { createStyles } from "../utils";

export type StatusSwitchesProperties = {
  isCompleted: boolean | undefined;
  onCompletedChange: (value: boolean | undefined) => void;
  isPinned: boolean | undefined;
  onPinnedChange: (value: boolean | undefined) => void;
};

export const StatusSwitches = ({
  isCompleted,
  onCompletedChange,
  isPinned,
  onPinnedChange,
}: StatusSwitchesProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Только завершённые</Text>
        <Switch
          value={isCompleted === true}
          onValueChange={(val) => onCompletedChange(val ? true : undefined)}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
          thumbColor={colors.text}
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Только не завершённые</Text>
        <Switch
          value={isCompleted === false}
          onValueChange={(val) => onCompletedChange(val ? false : undefined)}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
          thumbColor={colors.text}
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Только закреплённые</Text>
        <Switch
          value={isPinned === true}
          onValueChange={(val) => onPinnedChange(val ? true : undefined)}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
          thumbColor={colors.text}
        />
      </View>
    </View>
  );
};

const getStyles = createStyles((colors: ThemeColors) => ({
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
}));
