import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

import { useStarredRecords } from "../hooks/records/use-starred.hook";
import { RecordCard, SkeletonRecordsList } from "../components";
import { useRefresh, useTranslate } from "../hooks";
import { useTheme } from "../contexts";
import { createStyles } from "../utils";
import { NavigationProperty } from "../types";

export const StarredScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();

  const { data: records = [], isLoading, refetch } = useStarredRecords();

  const { RefreshableFlatList } = useRefresh({
    queryKeys: [["starred"]],
    onRefresh: refetch,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("starred.title"),
    });
  }, [navigation, t]);

  if (isLoading) {
    return <SkeletonRecordsList />;
  }

  if (records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="star-border" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>{t("starred.empty")}</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate("Sections")}
        >
          <Text style={styles.emptyButtonText}>{t("starred.goToRecords")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RefreshableFlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecordCard record={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
}));
