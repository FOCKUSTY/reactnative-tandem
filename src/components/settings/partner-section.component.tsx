import type { NavigationProperty } from "../../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { View, Text } from "react-native";

import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

import { SettingsItem } from "./settings-item.component";

export type PartnerSectionProps = {
  isPartnerLinked: boolean;
};

export const PartnerSection = ({ isPartnerLinked }: PartnerSectionProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Партнёр</Text>
      <View style={styles.card}>
        <SettingsItem
          icon="verified-user"
          label="Привязка партнёра"
          onPress={() => navigation.navigate("LinkPartner")}
          rightElement={
            <View style={styles.statusBadge}>
              <Text
                style={[
                  styles.statusText,
                  isPartnerLinked
                    ? styles.statusLinked
                    : styles.statusNotLinked,
                ]}
              >
                {isPartnerLinked ? "Привязан" : "Не привязан"}
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={colors.textMuted}
              />
            </View>
          }
        />
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  section: {
    marginBottom: 24,
  },
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
    overflow: "hidden",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusLinked: {
    color: colors.success,
  },
  statusNotLinked: {
    color: colors.textMuted,
  },
}));
