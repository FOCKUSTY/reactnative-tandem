import { FlatList, View } from "react-native";
import { SkeletonRecordCard } from "./record-card.skeleton";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonRecordsList = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <FlatList
        data={[1, 2, 3, 4, 5]}
        keyExtractor={(item) => String(item)}
        renderItem={() => <SkeletonRecordCard />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
}));
