import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonLinkPartner = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <SkeletonLoader width="60%" height={28} style={{ marginBottom: 20 }} />
      <SkeletonLoader width="100%" height={60} style={{ marginBottom: 16 }} />
      <SkeletonLoader
        width="100%"
        height={44}
        borderRadius={8}
        style={{ marginBottom: 16 }}
      />
      <SkeletonLoader width="100%" height={48} borderRadius={8} />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
}));
