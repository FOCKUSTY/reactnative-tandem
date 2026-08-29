import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonLogs = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SkeletonLoader width="30%" height={24} />
        <View style={styles.headerActions}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width={24} height={24} borderRadius={12} />
        </View>
      </View>
      <View style={styles.logContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonLoader
            key={i}
            width="100%"
            height={16}
            style={{ marginVertical: 2 }}
          />
        ))}
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  logContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
}));
