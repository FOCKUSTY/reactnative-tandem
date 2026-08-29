import { useState } from "react";
import { View, FlatList, Text, TouchableOpacity } from "react-native";

import { RecordCard, CalendarView } from "../components";
import { useTranslate } from "../hooks";
import { createStyles } from "../utils";
import { useRecords } from "../hooks";
import { useTheme } from "../contexts";

export const CalendarScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  const { data: allRecords = [] } = useRecords();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const recordsForDate = selectedDate
    ? allRecords.filter(
        (r) => r.dateEvent && r.dateEvent.startsWith(selectedDate),
      )
    : [];

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      <CalendarView records={allRecords} onDayPress={handleDayPress} />

      {selectedDate && (
        <View style={styles.listContainer}>
          <Text style={styles.dateTitle}>
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
          {recordsForDate.length === 0 ? (
            <Text style={styles.emptyText}>{t("records.empty")}</Text>
          ) : (
            <FlatList
              data={recordsForDate}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RecordCard record={item} />}
              contentContainerStyle={styles.listContent}
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedDate(null)}
          >
            <Text style={styles.closeButtonText}>{t("common.close")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 16,
  },
  closeButton: {
    alignSelf: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
}));
