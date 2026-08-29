import { ScrollView, View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonCreateRecord = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <SkeletonLoader width="30%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={44} borderRadius={8} />
      </View>
      <View style={styles.field}>
        <SkeletonLoader width="30%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={44} borderRadius={8} />
      </View>
      <View style={styles.field}>
        <SkeletonLoader width="30%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={120} borderRadius={8} />
      </View>
      <View style={styles.field}>
        <SkeletonLoader width="30%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={44} borderRadius={8} />
      </View>
      <View style={styles.field}>
        <SkeletonLoader width="30%" height={16} style={{ marginBottom: 6 }} />
        <View style={styles.tags}>
          <SkeletonLoader width={60} height={30} borderRadius={14} />
          <SkeletonLoader width={70} height={30} borderRadius={14} />
          <SkeletonLoader width={50} height={30} borderRadius={14} />
        </View>
      </View>
      <View style={styles.checkboxRow}>
        <SkeletonLoader width={24} height={24} borderRadius={4} />
        <SkeletonLoader width="20%" height={16} style={{ marginLeft: 6 }} />
        <SkeletonLoader
          width={24}
          height={24}
          borderRadius={4}
          style={{ marginLeft: 20 }}
        />
        <SkeletonLoader width="20%" height={16} style={{ marginLeft: 6 }} />
      </View>
      <SkeletonLoader
        width="100%"
        height={48}
        borderRadius={8}
        style={{ marginTop: 8 }}
      />
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
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
}));
