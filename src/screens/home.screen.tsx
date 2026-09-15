import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  PartnerLinkBannerComponent,
  ReportsColumns,
  SectionPager,
  SectionPagerItem,
  SectionPreview,
  SkeletonHome,
} from "../components";
import {
  createStyles,
  getFilteredRecords,
  splitReportsByTiming,
} from "../utils";
import { useAuth, useTheme } from "../contexts";
import { useRecords, useRefresh, useTranslate } from "../hooks";
import { useNavigation } from "@react-navigation/native";
import { NavigationProperty } from "../types";
import { useLayoutEffect } from "react";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useQueryClient } from "@tanstack/react-query";

export const HomeScreen = () => {
  const { t } = useTranslate();

  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors);
  const { data: allRecords = [], isLoading } = useRecords();
  const queryClient = useQueryClient();

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
          <TouchableOpacity
            onPress={() => {
              queryClient.invalidateQueries({
                queryKey: [["records"], ["sections"], ["starred"]],
              });
            }}
          >
            <MaterialIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>

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

  const reportRecords = allRecords.filter((r) => r.isReport);
  const { before: reportsBefore, after: reportsAfter } =
    splitReportsByTiming(reportRecords);

  const pagerItems: SectionPagerItem[] = [
    {
      key: "dates",
      slug: "dates",
      title: t("home.upcomingDates"),
      emptyMessage: t("home.noDates"),
      createLabel: t("home.addDate"),
      viewAllLabel: t("home.viewAllDates"),
      records: upcomingDates,
    },
    {
      key: "plans",
      slug: "plans",
      title: t("home.activePlans"),
      emptyMessage: t("home.noPlans"),
      createLabel: t("common.create"),
      viewAllLabel: t("home.viewAllPlans"),
      records: activePlans,
    },
  ];

  if (isLoading) {
    return <SkeletonHome />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {t("home.greeting", { name: user?.name })}
      </Text>
      <PartnerLinkBannerComponent />

      <ReportsColumns before={reportsBefore} after={reportsAfter} />

      <SectionPager items={pagerItems} />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    paddingVertical: 8,
    paddingInline: 16,
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
