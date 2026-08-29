import { View, ScrollView } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonFilter = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.filtersContainer}>
        <View style={styles.field}>
          <SkeletonLoader width="40%" height={16} style={{ marginBottom: 8 }} />
          <View style={styles.chips}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader
                key={i}
                width={60}
                height={30}
                borderRadius={20}
              />
            ))}
          </View>
        </View>
        <View style={styles.field}>
          <SkeletonLoader width="30%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="100%" height={44} borderRadius={8} />
        </View>
        <View style={styles.field}>
          <SkeletonLoader width="30%" height={16} style={{ marginBottom: 8 }} />
          <View style={styles.row}>
            <SkeletonLoader width="45%" height={40} borderRadius={8} />
            <SkeletonLoader width="45%" height={40} borderRadius={8} />
          </View>
        </View>
        <View style={styles.field}>
          <SkeletonLoader width="30%" height={16} style={{ marginBottom: 8 }} />
          <View style={styles.radioGroup}>
            {[1, 2, 3].map((i) => (
              <SkeletonLoader
                key={i}
                width={70}
                height={30}
                borderRadius={20}
              />
            ))}
          </View>
        </View>
        <View style={styles.field}>
          <SkeletonLoader width="30%" height={16} style={{ marginBottom: 8 }} />
          <View style={styles.radioGroup}>
            {[1, 2, 3].map((i) => (
              <SkeletonLoader
                key={i}
                width={70}
                height={30}
                borderRadius={20}
              />
            ))}
          </View>
        </View>
        <SkeletonLoader
          width="100%"
          height={44}
          borderRadius={8}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
      <View style={styles.resultsContainer}>
        <SkeletonLoader width="30%" height={14} style={{ marginVertical: 8 }} />
        {[1, 2, 3].map((i) => (
          <SkeletonRecordCard key={i} />
        ))}
      </View>
    </View>
  );
};

// для краткости используем уже существующий скелетон карточки
import { SkeletonRecordCard } from "./record-card.skeleton";

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    margin: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    maxHeight: "40%",
  },
  field: {
    marginBottom: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
}));
