import type { Section } from "../../types";

import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { ThemeColors } from "../../constants";
import { createStyles } from "../../utils";
import { useTheme } from "../../contexts";

export type SectionsSelectorProperties = {
  sections: Section[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export const SectionsSelector = ({
  sections,
  selectedIds,
  onToggle,
}: SectionsSelectorProperties) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View>
      {sections.map((section) => (
        <TouchableOpacity
          key={section.id}
          style={styles.sectionItem}
          onPress={() => onToggle(section.id)}
        >
          <MaterialIcons
            name={
              selectedIds.includes(section.id)
                ? "check-box"
                : "check-box-outline-blank"
            }
            size={24}
            color={colors.primary}
          />
          <Text style={styles.sectionName}>{section.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getStyles = createStyles((colors: ThemeColors) => ({
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  sectionName: {
    fontSize: 16,
    color: colors.text,
  },
}));
