import { View, Text } from "react-native";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";
import { NAME, VERSION } from "../../constants";

export const AppFooter = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {NAME} {VERSION}
      </Text>
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
