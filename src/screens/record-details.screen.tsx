import type { NavigationProperty } from "../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

import { RecordContent } from "../components";
import { useRecordDetail } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { useTranslate } from "../hooks";

export const RecordDetailsScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { record, isLoading, error, handleDelete, handleEdit } =
    useRecordDetail();
  const navigation = useNavigation<NavigationProperty>();

  useLayoutEffect(() => {
    if (record) {
      navigation.setOptions({
        title: record.title || t("records.details"),
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <MaterialIcons name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.headerButton, { marginLeft: 16 }]}
            >
              <MaterialIcons
                name="delete-outline"
                size={24}
                color={colors.danger}
              />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [record, colors, t]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
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

  const dateLabel = record.dateEvent
    ? new Date(record.dateEvent).toLocaleDateString()
    : null;
  const timeLabel = record.dateEvent
    ? new Date(record.dateEvent).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <RecordContent
      title={record.title}
      dateLabel={dateLabel}
      timeLabel={timeLabel}
      content={record.content}
      tags={record.tags}
      isCompleted={record.isCompleted}
      isPinned={record.isPinned}
      createdAt={record.createdAt}
      updatedAt={record.updatedAt}
    />
  );
};

const getStyles = createStyles((colors) => ({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginTop: 12,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 4,
  },
}));

export default RecordDetailsScreen;
