import { ScrollView, View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonRecordDetail = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <SkeletonLoader width="60%" height={28} style={{ marginBottom: 12 }} />
        <View style={styles.dateContainer}>
          <SkeletonLoader width={20} height={20} borderRadius={10} />
          <SkeletonLoader width="50%" height={16} style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.body}>
          <SkeletonLoader
            width="100%"
            height={16}
            style={{ marginVertical: 4 }}
          />
          <SkeletonLoader
            width="100%"
            height={16}
            style={{ marginVertical: 4 }}
          />
          <SkeletonLoader
            width="70%"
            height={16}
            style={{ marginVertical: 4 }}
          />
        </View>
        <View style={styles.tags}>
          <SkeletonLoader width={50} height={24} borderRadius={12} />
          <SkeletonLoader width={60} height={24} borderRadius={12} />
          <SkeletonLoader width={40} height={24} borderRadius={12} />
        </View>
        <View style={styles.meta}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.metaRow}>
              <SkeletonLoader width="30%" height={14} />
              <SkeletonLoader width="40%" height={14} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  body: {
    marginBottom: 12,
  },
  tags: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  meta: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
}));
