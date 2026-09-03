import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { useReminder } from "../../hooks/use-reminder.hook";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

const OPTIONS = [
  { label: "1 час", value: 1 },
  { label: "2 часа", value: 2 },
  { label: "12 часов", value: 12 },
  { label: "1 день", value: 24 },
  { label: "2 дня", value: 48 },
];

export const ReminderSection = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { offsetHours, updateOffset } = useReminder();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Напоминания</Text>
      <View style={styles.card}>
        <Text style={styles.label}>За сколько напомнить о событии</Text>
        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                offsetHours === opt.value && styles.optionButtonActive,
              ]}
              onPress={() => updateOffset(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  offsetHours === opt.value && styles.optionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  optionButtonActive: {
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
