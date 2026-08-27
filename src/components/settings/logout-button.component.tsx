import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export type LogoutButtonProps = {
  onPress: () => void;
};

export const LogoutButton = ({ onPress }: LogoutButtonProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={onPress}>
      <MaterialIcons name="logout" size={20} color={colors.danger} />
      <Text style={styles.logoutText}>Выйти</Text>
    </TouchableOpacity>
  );
};

const getStyles = createStyles((colors) => ({
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 8,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.danger,
  },
}));
