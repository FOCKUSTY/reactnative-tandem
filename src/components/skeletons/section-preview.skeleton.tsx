import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonSectionPreview = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.card}>
      <SkeletonLoader width="40%" height={22} style={{ marginBottom: 8 }} />
      <View style={styles.scrollView}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.dateItem}>
            <SkeletonLoader width="50%" height={16} />
            <SkeletonLoader width="80%" height={14} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
      <View style={styles.actionsRow}>
        <SkeletonLoader width="30%" height={36} borderRadius={8} />
        <SkeletonLoader width="30%" height={36} borderRadius={8} />
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scrollView: {
    maxHeight: 200,
    backgroundColor: colors.scrollBackground,
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  dateItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
}));
