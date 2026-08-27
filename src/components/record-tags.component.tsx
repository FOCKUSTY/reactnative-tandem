import { View, Text } from "react-native";
import { useTheme } from "../contexts";
import { createStyles } from "../utils";

export type RecordTagsProperties = {
  tags: string[];
};

export const RecordTags = ({ tags }: RecordTagsProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.tagsContainer}>
      {tags.map((tag) => (
        <View key={tag} style={styles.tag}>
          <Text style={styles.tagText}>#{tag}</Text>
        </View>
      ))}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
}));
