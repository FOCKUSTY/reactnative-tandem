import type { MyRecord } from "../../types";
import { ScrollView, Text, View } from "react-native";

import { ReportMiniCard } from "./report-mini-card.component";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";

type ReportsColumnsProps = {
  before: MyRecord[];
  after: MyRecord[];
};

export const ReportsColumns = ({ before, after }: ReportsColumnsProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.row}>
      <ReportsColumn
        title={t("home.reportsAfter")}
        empty={t("home.noReportsAfter")}
        records={after}
      />
      <ReportsColumn
        title={t("home.reportsBefore")}
        empty={t("home.noReportsBefore")}
        records={before}
      />
    </View>
  );
};

const ReportsColumn = ({
  title,
  empty,
  records,
}: {
  title: string;
  empty: string;
  records: MyRecord[];
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.columnBox}>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>{empty}</Text>
        ) : (
          <ScrollView
            nestedScrollEnabled
            style={{ height: 200 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            {records.map((r) => (
              <ReportMiniCard key={r.id} record={r} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  columnBox: {
    maxHeight: 260,
    backgroundColor: colors.scrollBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  scrollContent: {
    padding: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 12,
    paddingTop: 24,
  },
}));
