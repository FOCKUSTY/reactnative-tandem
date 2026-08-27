import type { Section } from "../types";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts";
import { createStyles } from "../utils";

export type FilterSectionChipsProperties = {
  sections: Section[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export const FilterSectionChips = ({
  sections,
  selectedIds,
  onToggle,
}: FilterSectionChipsProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Секции</Text>
      <View style={styles.chipsContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.chip,
              selectedIds.includes(section.id) && styles.chipActive,
            ]}
            onPress={() => onToggle(section.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedIds.includes(section.id) && styles.chipTextActive,
              ]}
            >
              {section.name}
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
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chipTextActive: {
    color: "#fff",
  },
}));
