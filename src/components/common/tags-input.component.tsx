import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";

export type TagsInputProps = {
  tags: string[];
  inputValue: string;
  onInputChange: (text: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
};

export const TagsInputComponent = ({
  tags,
  inputValue,
  onInputChange,
  onAddTag,
  onRemoveTag,
}: TagsInputProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View>
      <View style={styles.tagInputContainer}>
        <TextInput
          style={[styles.input, styles.tagInput]}
          placeholder="Введите тег"
          placeholderTextColor={colors.textMuted}
          value={inputValue}
          onChangeText={onInputChange}
          onSubmitEditing={onAddTag}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={onAddTag}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity onPress={() => onRemoveTag(tag)}>
              <MaterialIcons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
}));
