import type { MarkedDates } from "react-native-calendars/src/types";
import type { MyRecord } from "../../types";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";

type CalendarViewProps = {
  records: MyRecord[];
  onDayPress: (date: string) => void;
};

export const CalendarView = ({ records, onDayPress }: CalendarViewProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const markedDates = records.reduce<MarkedDates>((acc, record) => {
    if (record.dateEvent) {
      const dateKey = record.dateEvent.split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { marked: true, dotColor: colors.danger };
      }
    }
    return acc;
  }, {});

  const today = new Date().toISOString().split("T")[0];
  if (markedDates[today]) {
    markedDates[today].selected = true;
    markedDates[today].selectedColor = colors.primary;
  }

  return (
    <Calendar
      style={styles.calendar}
      theme={{
        backgroundColor: colors.background,
        calendarBackground: colors.card,
        textSectionTitleColor: colors.textSecondary,
        selectedDayBackgroundColor: colors.primary,
        selectedDayTextColor: "#fff",
        todayTextColor: colors.primary,
        dayTextColor: colors.text,
        textDisabledColor: colors.textMuted,
        dotColor: colors.primary,
        selectedDotColor: "#fff",
        arrowColor: colors.primary,
        monthTextColor: colors.text,
        indicatorColor: colors.primary,
      }}
      markedDates={markedDates}
      onDayPress={(day) => {
        onDayPress(day.dateString);
      }}
    />
  );
};

const getStyles = createStyles((colors) => ({
  calendar: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    marginBottom: 16,
  },
}));
