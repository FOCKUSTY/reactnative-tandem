import type { MaterialIconsIconName } from "@react-native-vector-icons/material-icons";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts";
import { createStyles } from "../utils";

export type SettingsItemProps = {
  icon: MaterialIconsIconName;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
};

export const SettingsItem = ({
  icon,
  label,
  onPress,
  rightElement,
}: SettingsItemProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <MaterialIcons
          name={icon}
          size={22}
          color={colors.primary}
          style={styles.itemIcon}
        />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {rightElement || (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={colors.textMuted}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = createStyles((colors) => ({
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: colors.text,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
}));
