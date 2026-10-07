import type { NavigationProperty } from "../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

import {
  RecordContent,
  SkeletonRecordDetail,
  OverflowMenu,
} from "../components";
import { useRecordDetail, useShare, useToggleStar } from "../hooks";
import { createStyles, formatDate, formatTime } from "../utils";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

export const RecordDetailsScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { record, isLoading, error, handleDelete, handleEdit } =
    useRecordDetail();
  const navigation = useNavigation<NavigationProperty>();

  const { shareRecord } = useShare();
  const { toggleStar, isPending: starPending } = useToggleStar();

  const handleShare = () => record && shareRecord(record);

  const handleToggleStar = () => {
    if (!record || starPending) return;
    void toggleStar(record.id, !!record.isStarred);
  };

  useLayoutEffect(() => {
    if (!record) return;

    navigation.setOptions({
      title: record.title || t("records.details"),
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.headerButton}
            accessibilityLabel={t("common.edit")}
          >
            <MaterialIcons name="edit" size={22} color={colors.primary} />
          </TouchableOpacity>
          <OverflowMenu
            actions={[
              {
                label: record.isStarred
                  ? t("records.unstar")
                  : t("records.star"),
                onPress: handleToggleStar,
              },
              { label: t("records.share"), onPress: handleShare },
              {
                label: t("common.delete"),
                onPress: handleDelete,
                destructive: true,
              },
            ]}
          />
        </View>
      ),
    });
  }, [
    record,
    record?.isStarred,
    starPending,
    colors,
    t,
    handleShare,
    handleEdit,
    handleDelete,
    handleToggleStar,
  ]);

  if (isLoading) {
    return <SkeletonRecordDetail />;
  }

  if (error || !record) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialIcons name="error-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>
          {error ? t("records.error.loadFailed") : t("records.error.notFound")}
        </Text>
      </View>
    );
  }

  const dateLabel = record.dateEvent ? formatDate(record.dateEvent) : null;
  const timeLabel = record.dateEvent ? formatTime(record.dateEvent) : null;

  return (
    <RecordContent
      record={record}
      dateLabel={dateLabel}
      timeLabel={timeLabel}
    />
  );
};

const getStyles = createStyles((colors) => ({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginTop: 12,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerButton: {
    padding: 6,
  },
}));

export default RecordDetailsScreen;
