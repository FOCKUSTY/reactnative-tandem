import { TextInput } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

export type TagsInputFilterProperties = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export const TagsInputFilter = ({
  value,
  onChange,
  placeholder,
}: TagsInputFilterProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder ?? t("filters.tagsPlaceholder")}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChange}
    />
  );
};

const getStyles = createStyles((colors) => ({
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
}));
