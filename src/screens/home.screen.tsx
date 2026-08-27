import { View, Text } from "react-native";

import { PartnerLinkBannerComponent, SectionPreview } from "../components";
import { createStyles, getFilteredRecords } from "../utils";
import { useAuth, useTheme } from "../contexts";
import { useRecords } from "../hooks";

export const HomeScreen = () => {
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
      <Text style={styles.greeting}>Привет, {user?.name}</Text>
      <PartnerLinkBannerComponent />

      <SectionPreview
        records={upcomingDates}
        sectionSlug="dates"
        title="Ближайшие даты"
        emptyMessage="Нет предстоящих дат"
        createLabel="Добавить дату"
        viewAllLabel="Все даты"
      />

      <SectionPreview
        records={activePlans}
        sectionSlug="plans"
        title="Активные планы"
        emptyMessage="Нет активных планов"
        createLabel="Создать план"
        viewAllLabel="Все планы"
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
