import type { PairUser } from "../../types";
import { View, Text } from "react-native";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";

export type LinkedPartnerInfoProperties = {
  partner: PairUser | null;
};

export const LinkedPartnerInfo = ({ partner }: LinkedPartnerInfoProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.linkedContainer}>
      <Text style={styles.linkedText}>Вы уже привязаны</Text>
      <Text style={styles.linkedSubtext}>
        Партнёр: {partner?.name || partner?.username || "неизвестно"}
      </Text>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  linkedContainer: {
    backgroundColor: "#1E3A2A",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E5A3A",
  },
  linkedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.success,
  },
  linkedSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
}));
