import { View, ScrollView } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonSettings = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const renderSection = (titleWidth: number) => (
    <View style={styles.section}>
      <SkeletonLoader
        width={titleWidth}
        height={14}
        style={styles.sectionTitle}
      />
      <View style={styles.card}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.item}>
            <SkeletonLoader width="60%" height={18} />
            <SkeletonLoader width={40} height={18} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderSection(80)}
      {renderSection(60)}
      {renderSection(100)}
      {renderSection(70)}
      {renderSection(50)}
      <View style={styles.logoutButton}>
        <SkeletonLoader width="100%" height={48} borderRadius={12} />
      </View>
      <View style={styles.footer}>
        <SkeletonLoader width="40%" height={12} />
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  logoutButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
}));
