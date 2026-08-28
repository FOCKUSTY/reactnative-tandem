import { TextInput } from "react-native";
import { useTheme } from "../../contexts";
import { ThemeColors } from "../../constants";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

export type SearchInputProperties = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export const SearchInput = ({
  value,
  onChange,
  placeholder,
}: SearchInputProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder ?? t("common.search")}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChange}
    />
  );
};

const getStyles = createStyles((colors: ThemeColors) => ({
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
