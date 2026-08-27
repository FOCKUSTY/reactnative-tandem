import { View, Text } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const AppFooter = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Тандем 0.0.1-indev</Text>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
}));
