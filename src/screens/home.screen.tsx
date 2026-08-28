import { View, Text } from "react-native";

import { PartnerLinkBannerComponent, SectionPreview } from "../components";
import { createStyles, getFilteredRecords } from "../utils";
import { useAuth, useTheme } from "../contexts";
import { useRecords, useTranslate } from "../hooks";

export const HomeScreen = () => {
  const { t } = useTranslate();

  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors);
  const { data: allRecords = [] } = useRecords();

  const upcomingDates = getFilteredRecords(allRecords, {
    onlyFuture: true,
  }).filter((r) => r.section?.slug !== "plans");

  const activePlans = getFilteredRecords(allRecords, {
    onlyFuture: true,
    hideCompleted: true,
  }).filter((r) => r.section?.slug === "plans");

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {t("home.greeting", { name: user?.name })}
      </Text>
      <PartnerLinkBannerComponent />

      <SectionPreview
        records={upcomingDates}
        sectionSlug="dates"
        title={t("home.upcomingDates")}
        emptyMessage={t("home.noDates")}
        createLabel={t("home.addDate")}
        viewAllLabel={t("home.viewAllDates")}
      />

      <SectionPreview
        records={activePlans}
        sectionSlug="plans"
        title={t("home.activePlans")}
        emptyMessage={t("home.noPlans")}
        createLabel={t("common.create")}
        viewAllLabel={t("home.viewAllPlans")}
      />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
    gap: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
}));

export default HomeScreen;
