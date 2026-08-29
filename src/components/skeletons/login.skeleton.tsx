import { View } from "react-native";
import { SkeletonLoader } from "./skeleton-loader.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export const SkeletonLogin = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <SkeletonLoader
        width="50%"
        height={34}
        style={{ marginBottom: 30, alignSelf: "center" }}
      />
      <SkeletonLoader
        width="100%"
        height={44}
        borderRadius={8}
        style={{ marginBottom: 15 }}
      />
      <SkeletonLoader
        width="100%"
        height={44}
        borderRadius={8}
        style={{ marginBottom: 15 }}
      />
      <SkeletonLoader width="100%" height={48} borderRadius={8} />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
}));
