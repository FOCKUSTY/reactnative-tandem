import type { MyRecord, RootStackParameters } from "../../types";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { createStyles, formatDateTime } from "../../utils";
import { useTheme } from "../../contexts";
import { useSections, useTranslate } from "../../hooks";

export type SectionPreviewProperties = {
  records: MyRecord[];
  sectionSlug: string;
  title: string;
  emptyMessage: string;
  createLabel?: string;
  viewAllLabel?: string;
  limit?: number;
  onViewAll?: () => void;
  onAdd?: () => void;
};

export const SectionPreview = ({
  records,
  sectionSlug,
  title,
  emptyMessage,
  createLabel,
  viewAllLabel,
  limit = 5,
  onAdd,
  onViewAll,
}: SectionPreviewProperties) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParameters>>();
  const { data: sections } = useSections();
  const section = sections?.find((s) => s.slug === sectionSlug);

  const displayRecords = records.slice(0, limit);
  const hasMore = records.length > limit;

  const handleCreate = () => {
    if (onAdd) {
      return onAdd();
    }

    if (section) {
      navigation.navigate("CreateRecord", { sectionId: section.id });
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      return onViewAll();
    }

    if (section) {
      navigation.navigate("Records", { sectionId: section.id, title });
    }
  };

  const handleRecordPress = (record: MyRecord) => {
    navigation.navigate("RecordDetail", { id: record.id });
  };

  if (records.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>
            {createLabel ?? t("common.create")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {displayRecords.map((record) => (
          <TouchableOpacity
            key={record.id}
            style={styles.dateItem}
            onPress={() => handleRecordPress(record)}
            activeOpacity={0.6}
          >
            {record.isPinned && (
              <Text style={styles.pinnedBadge}>
                📌 {t("records.field.pinned")}
              </Text>
            )}
            {record.dateEvent && (
              <Text style={styles.cardDate}>
                {formatDateTime(record.dateEvent)}
              </Text>
            )}
            <Text style={styles.cardText} numberOfLines={2}>
              {record.content?.slice(0, 100) ||
                record.title ||
                t("records.noContent")}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.button, styles.addButtonSmall]}
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>
            {createLabel ?? t("common.create")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.viewAllButton]}
          onPress={handleViewAll}
        >
          <Text style={styles.buttonText}>
            {hasMore
              ? `${viewAllLabel ?? t("common.viewAll")} (${t("common.more")} ${records.length - limit})`
              : (viewAllLabel ?? t("common.viewAll"))}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.success,
  },
  addButtonSmall: {
    flex: 1,
    marginRight: 8,
  },
  viewAllButton: {
    flex: 1,
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scrollView: {
    maxHeight: 200,
    width: "100%",
    backgroundColor: colors.scrollBackground,
    borderRadius: 10,
    marginTop: 4,
  },
  scrollContent: {
    padding: 10,
  },
  dateItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    paddingBottom: 8,
  },
  cardDate: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  pinnedBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    marginVertical: 8,
  },
}));
