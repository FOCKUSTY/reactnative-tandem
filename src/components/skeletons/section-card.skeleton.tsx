import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonSectionCard = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <SkeletonLoader width={32} height={32} borderRadius={16} />
      </View>
      <View style={styles.textContainer}>
        <SkeletonLoader width="60%" height={18} />
        <SkeletonLoader width="30%" height={14} style={{ marginTop: 4 }} />
      </View>
      <SkeletonLoader width={24} height={24} borderRadius={12} />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
}));
