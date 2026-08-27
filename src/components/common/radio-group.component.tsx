import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

export type RadioOption<T extends string> = {
  value: T;
  label: string;
};

export type RadioGroupProps<T extends string> = {
  options: RadioOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  title?: string;
};

export const RadioGroup = <T extends string>({
  options,
  selected,
  onSelect,
  title,
}: RadioGroupProps<T>) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.group}>
        {options.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[styles.option, selected === value && styles.optionActive]}
            onPress={() => onSelect(value)}
          >
            <Text
              style={[
                styles.optionText,
                selected === value && styles.optionTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  group: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  optionTextActive: {
    color: "#fff",
  },
}));
