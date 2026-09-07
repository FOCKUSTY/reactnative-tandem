import type { NavigationProperty } from "../types";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

import { RecordContent, SkeletonRecordDetail } from "../components";
import { useRecordDetail } from "../hooks";
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
      record={{
        ...record,
        dateLabel,
        timeLabel,
      }}
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
