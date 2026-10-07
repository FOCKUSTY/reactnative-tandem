import type { MyRecord, NavigationProperty } from "../../types";
import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../contexts";
import { createStyles, getDaysDiff, pluralKey } from "../../utils";
import { useTranslate } from "../../hooks";

export const ReportMiniCard = ({ record }: { record: MyRecord }) => {
  const { colors } = useTheme();
  const { t, l } = useTranslate();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  const diff = getDaysDiff(record.dateEvent);
  const absDays = diff === null ? 0 : Math.abs(diff);

  const labelKey =
    diff === null
      ? "home.today"
      : diff > 0
        ? pluralKey("home.daysLeft", diff, l)
        : diff < 0
          ? pluralKey("home.daysAgo", absDays, l)
          : ("home.today" as const);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RecordDetail", { id: record.id })}
      activeOpacity={0.7}
    >
      <Text style={styles.title} numberOfLines={2}>
        {record.title || t("records.untitled")}
      </Text>
      {diff !== null && (
        <View style={styles.daysBlock}>
          <Text style={styles.daysNumber}>{absDays}</Text>
          <Text style={styles.daysLabel}>{t(labelKey)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = createStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 96,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  daysBlock: {
    marginTop: 8,
  },
  daysNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 32,
  },
  daysLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.2,
  },
}));
