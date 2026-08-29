import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { SkeletonRecordCard } from "./record-card.skeleton";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonCalendar = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.calendar}>
        <SkeletonLoader width="100%" height={300} borderRadius={12} />
      </View>
      <View style={styles.listContainer}>
        <SkeletonLoader width="40%" height={20} style={{ marginBottom: 8 }} />
        {[1, 2].map((i) => (
          <SkeletonRecordCard key={i} />
        ))}
        <View style={styles.closeButton}>
          <SkeletonLoader width="30%" height={40} borderRadius={8} />
        </View>
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
  calendar: {
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  closeButton: {
    alignSelf: "center",
    marginTop: 16,
  },
}));
