import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { SkeletonSectionPreview } from "./section-preview.skeleton";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonHome = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <SkeletonLoader width="60%" height={30} style={{ marginBottom: 16 }} />
      <SkeletonSectionPreview />
      <SkeletonSectionPreview />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
}));
