import { View, Text, FlatList } from "react-native";
import { useTheme } from "../contexts";
import { useRemindersList } from "../hooks/use-reminders-list.hook";
import { createStyles, formatDateTime } from "../utils";
import { useTranslate } from "../hooks";
import { MyRecord } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

export const RemindersScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const { records, offsets } = useRemindersList();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("reminders.title"),
    });
  }, [navigation, t]);

  const formatOffset = (minutes: number) => {
    if (minutes === 0) return t("reminders.offset.now");
    if (minutes < 60) {
      return t("reminders.offset.minutes", { count: minutes });
    }
    const hours = minutes / 60;
    if (Number.isInteger(hours)) {
      return t("reminders.offset.hours_few", { count: hours });
    }
    return t("reminders.offset.minutes", { count: minutes });
  };

  const renderItem = ({ item }: { item: MyRecord & { dateEvent: string } }) => {
    const notificationTimes = offsets.map((offset) => {
      const trigger = new Date(
        new Date(item.dateEvent).getTime() - offset * 60 * 1000,
      );
      return { offset, trigger };
    });

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title || t("records.untitled")}</Text>
        <Text style={styles.date}>📅 {formatDateTime(item.dateEvent)}</Text>
        <View style={styles.offsetsContainer}>
          <Text style={styles.offsetsLabel}>
            {t("notifications.reminder.offsetsLabel")}
          </Text>
          {notificationTimes.map(({ offset, trigger }) => (
            <View key={offset} style={styles.offsetRow}>
              <Text style={styles.offsetText}>
                за {formatOffset(offset)} → {formatDateTime(trigger)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t("reminders.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  offsetsContainer: {
    marginTop: 4,
  },
  offsetsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 4,
  },
  offsetRow: {
    paddingVertical: 2,
  },
  offsetText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
  },
}));
