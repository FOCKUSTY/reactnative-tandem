import { Text, TouchableOpacity, View } from "react-native";

import {
  PartnerLinkBannerComponent,
  SectionPreview,
  SkeletonHome,
} from "../components";
import { createStyles, getFilteredRecords } from "../utils";
import { useAuth, useTheme } from "../contexts";
import { useRecords, useRefresh, useTranslate } from "../hooks";
import { useNavigation } from "@react-navigation/native";
import { NavigationProperty } from "../types";
import { useLayoutEffect } from "react";
import MaterialIcons from "@react-native-vector-icons/material-icons";

export const HomeScreen = () => {
  const { t } = useTranslate();

  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors);
  const { data: allRecords = [], isLoading } = useRecords();

  const navigation = useNavigation<NavigationProperty>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            padding: 8,
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("Starred")}>
            <MaterialIcons name="star-rate" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  const upcomingDates = getFilteredRecords(allRecords, {
    onlyFuture: true,
  }).filter((r) => r.section?.slug !== "plans");

  const activePlans = getFilteredRecords(allRecords, {
    onlyFuture: true,
    hideCompleted: true,
  }).filter((r) => r.section?.slug === "plans");

  const { RefreshableScrollView } = useRefresh({
    queryKeys: [["records"], ["sections"], ["starred"]],
  });

  if (isLoading) {
    return <SkeletonHome />;
  }

  return (
    <RefreshableScrollView style={styles.container}>
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
    </RefreshableScrollView>
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
