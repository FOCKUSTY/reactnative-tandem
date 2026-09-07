import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import { useState } from "react";
import { TranslationInput } from "../../i18n";

export type RecurringPickerProps = {
  value: string;
  onChange: (interval: string) => void;
};

const PRESETS: { label: TranslationInput; value: string }[] = [
  { label: "recurring.everyHour", value: "1h" },
  { label: "recurring.everyDay", value: "1d" },
  { label: "recurring.everyWeek", value: "7d" },
  { label: "recurring.everyMonth", value: "1m" },
  { label: "recurring.everyYear", value: "1y" },
];

export const RecurringPicker = ({ value, onChange }: RecurringPickerProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslate();

  const isCustom = !PRESETS.some((p) => p.value === value);
  const [customText, setCustomText] = useState(isCustom ? value : "");

  const handleCustomChange = (text: string) => {
    setCustomText(text);
    if (text.trim()) onChange(text.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.presets}>
        {PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.value}
            style={[
              styles.presetChip,
              value === preset.value && styles.presetChipActive,
            ]}
            onPress={() => onChange(preset.value)}
          >
            <Text
              style={[
                styles.presetText,
                value === preset.value && styles.presetTextActive,
              ]}
            >
              {t(preset.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.customRow}>
        <Text style={styles.customLabel}>{t("recurring.ourInterval")}</Text>
        <TextInput
          style={styles.customInput}
          placeholder={`${t("recurring.example")} 3h, 2d, 2m`}
          placeholderTextColor={colors.textMuted}
          value={customText}
          onChangeText={handleCustomChange}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    marginVertical: 8,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  presetTextActive: {
    color: "#fff",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customLabel: {
    fontSize: 14,
    color: colors.text,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
  },
}));
