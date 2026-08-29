import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonRecordCard = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonLoader width="70%" height={20} />
        <SkeletonLoader width={24} height={24} borderRadius={12} />
      </View>
      <SkeletonLoader width="40%" height={14} style={{ marginVertical: 4 }} />
      <SkeletonLoader width="100%" height={14} style={{ marginVertical: 4 }} />
      <SkeletonLoader width="60%" height={14} style={{ marginVertical: 4 }} />
      <View style={styles.tags}>
        <SkeletonLoader width={50} height={24} borderRadius={12} />
        <SkeletonLoader width={60} height={24} borderRadius={12} />
        <SkeletonLoader width={40} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tags: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
}));
